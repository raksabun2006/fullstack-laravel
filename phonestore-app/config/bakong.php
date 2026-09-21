<?php

return [
    'api_url' => env('BAKONG_API_URL', 'https://api-bakong.nbc.gov.kh'),
    'api_token' => env('BAKONG_API_TOKEN', ''),

    'merchant_name' => env('BAKONG_MERCHANT_NAME', 'PhoneStore Cambodia'),
    'merchant_city' => env('BAKONG_MERCHANT_CITY', 'PHNOM PENH'),
    'account_id' => env('BAKONG_ACCOUNT_ID', 'phonestore@devb'),
    'currency' => env('BAKONG_CURRENCY', 'USD'),
    'timeout' => (int) env('BAKONG_TIMEOUT', 15),
];
