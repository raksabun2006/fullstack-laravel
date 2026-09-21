<?php

namespace App\Services;

use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class BakongService
{
    protected string $apiUrl;
    protected string $apiToken;
    protected string $merchantName;
    protected string $merchantCity;
    protected string $accountId;
    protected string $currency;
    protected int $timeout;

    public function __construct()
    {
        $this->apiUrl = rtrim(config('bakong.api_url', 'https://api-bakong.nbc.gov.kh'), '/');
        $this->apiToken = (string) config('bakong.api_token', '');
        $this->merchantName = (string) config('bakong.merchant_name', 'PhoneStore Cambodia');
        $this->merchantCity = (string) config('bakong.merchant_city', 'PHNOM PENH');
        $this->accountId = (string) config('bakong.account_id', 'phonestore@devb');
        $this->currency = strtoupper((string) config('bakong.currency', 'USD'));
        $this->timeout = (int) config('bakong.timeout', 15);
    }

    /**
     * Generate standard EMVCo KHQR String and MD5 hash.
     *
     * @param float|string $amount
     * @param string $currency ('USD' or 'KHR')
     * @param string $orderId
     * @return array{khqr: string, md5: string, amount: float, currency: string}
     */
    public function generateKhqr(float|string $amount, string $currency = 'USD', string $orderId = ''): array
    {
        $currency = strtoupper($currency ?: $this->currency);
        $amountFloat = (float) $amount;

        // KHR has no minor unit (integers only), USD has 2 decimal places
        if ($currency === 'KHR') {
            $formattedAmount = (string) (int) round($amountFloat);
            $amountFloat = (float) (int) round($amountFloat);
        } else {
            $amountFloat = round($amountFloat, 2);
            $formattedAmount = number_format($amountFloat, 2, '.', '');
        }

        // 1. Tag 00: Payload Format Indicator ("01")
        $tag00 = $this->formatTlv('00', '01');

        // 2. Tag 01: Point of Initiation Method ("12" - Dynamic QR)
        $tag01 = $this->formatTlv('01', '12');

        // 3. Tag 29: Merchant Account Information (Bakong)
        // Subtag 00: Bakong Account ID
        // Subtag 01: Merchant Name/Identifier
        $subTag00 = $this->formatTlv('00', $this->accountId);
        $subTag01 = $this->formatTlv('01', $this->merchantName);
        $merchantAccountInfo = $subTag00 . $subTag01;
        $tag29 = $this->formatTlv('29', $merchantAccountInfo);

        // 4. Tag 52: Merchant Category Code (5999 - Miscellaneous Retail)
        $tag52 = $this->formatTlv('52', '5999');

        // 5. Tag 53: Transaction Currency (840 = USD, 116 = KHR)
        $currencyCode = $currency === 'KHR' ? '116' : '840';
        $tag53 = $this->formatTlv('53', $currencyCode);

        // 6. Tag 54: Transaction Amount
        $tag54 = $this->formatTlv('54', $formattedAmount);

        // 7. Tag 58: Country Code ("KH")
        $tag58 = $this->formatTlv('58', 'KH');

        // 8. Tag 59: Merchant Name
        $tag59 = $this->formatTlv('59', $this->merchantName);

        // 9. Tag 60: Merchant City
        $tag60 = $this->formatTlv('60', $this->merchantCity);

        // 10. Tag 62: Additional Data Field Template
        // Subtag 01: Bill / Reference Number
        $subTag62_01 = $this->formatTlv('01', $orderId ?: 'ORD-' . time());
        $tag62 = $this->formatTlv('62', $subTag62_01);

        // Assemble QR content without CRC
        $payloadWithoutCrc = $tag00 . $tag01 . $tag29 . $tag52 . $tag53 . $tag54 . $tag58 . $tag59 . $tag60 . $tag62 . '6304';

        // Calculate CRC16-CCITT
        $crc = $this->calculateCrc16($payloadWithoutCrc);
        $khqr = $payloadWithoutCrc . $crc;

        // Calculate 32-character lowercase hex MD5 hash required by Bakong check_transaction_by_md5
        $md5 = strtolower(md5($khqr));

        return [
            'khqr' => $khqr,
            'md5' => $md5,
            'amount' => $amountFloat,
            'currency' => $currency,
        ];
    }

    /**
     * Check transaction status with Bakong Open API via MD5 hash.
     *
     * @param string $md5
     * @return array{success: bool, found: bool, data: array|null, message: string}
     */
    public function checkTransactionByMd5(string $md5): array
    {
        $cleanMd5 = strtolower(trim($md5));

        if (empty($cleanMd5)) {
            return [
                'success' => false,
                'found' => false,
                'data' => null,
                'message' => 'Missing MD5 hash for payment verification',
            ];
        }

        $endpoint = "{$this->apiUrl}/v1/check_transaction_by_md5";

        try {
            $client = Http::timeout($this->timeout)
                ->withHeaders([
                    'Accept' => 'application/json',
                    'Content-Type' => 'application/json',
                ]);

            if (! empty($this->apiToken) && $this->apiToken !== 'YOUR_BAKONG_TOKEN') {
                $client = $client->withToken($this->apiToken);
            }

            $response = $client->post($endpoint, [
                'md5' => $cleanMd5,
            ]);

            if ($response->successful()) {
                $json = $response->json();

                // Bakong standard responseCode: 0 indicates success / transaction verified
                if (isset($json['responseCode']) && (int) $json['responseCode'] === 0 && ! empty($json['data'])) {
                    return [
                        'success' => true,
                        'found' => true,
                        'data' => $json['data'],
                        'message' => $json['responseMessage'] ?? 'Transaction verified successfully',
                    ];
                }

                return [
                    'success' => true,
                    'found' => false,
                    'data' => null,
                    'message' => $json['responseMessage'] ?? 'Transaction not yet completed',
                ];
            }

            $status = $response->status();
            $body = $response->json();

            // HTTP 404 indicates transaction has not been submitted or completed yet
            if ($status === 404) {
                return [
                    'success' => true,
                    'found' => false,
                    'data' => null,
                    'message' => $body['responseMessage'] ?? 'Transaction pending authorization on Bakong network',
                ];
            }

            Log::warning('Bakong API returned non-success HTTP status', [
                'status' => $status,
                'response' => $body,
                'md5' => $cleanMd5,
            ]);

            return [
                'success' => false,
                'found' => false,
                'data' => null,
                'message' => $body['responseMessage'] ?? "Bakong API returned HTTP {$status}",
            ];
        } catch (Exception $e) {
            Log::error('Bakong API request failed or timed out', [
                'error' => $e->getMessage(),
                'md5' => $cleanMd5,
            ]);

            return [
                'success' => false,
                'found' => false,
                'data' => null,
                'message' => 'Connection to Bakong payment network timed out or failed',
            ];
        }
    }

    /**
     * Format an EMVCo Tag-Length-Value object.
     */
    protected function formatTlv(string $tag, string $value): string
    {
        $length = str_pad((string) strlen($value), 2, '0', STR_PAD_LEFT);
        return $tag . $length . $value;
    }

    /**
     * Calculate EMVCo standard CRC16-CCITT (polynomial 0x1021, initial 0xFFFF).
     */
    protected function calculateCrc16(string $data): string
    {
        $crc = 0xFFFF;
        $length = strlen($data);

        for ($i = 0; $i < $length; $i++) {
            $crc ^= (ord($data[$i]) << 8);
            for ($j = 0; $j < 8; $j++) {
                if ($crc & 0x8000) {
                    $crc = (($crc << 1) ^ 0x1021) & 0xFFFF;
                } else {
                    $crc = ($crc << 1) & 0xFFFF;
                }
            }
        }

        return strtoupper(str_pad(dechex($crc), 4, '0', STR_PAD_LEFT));
    }
}
