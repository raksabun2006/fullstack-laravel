<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;

trait ApiResponse
{
    /**
     * Send a successful JSON response.
     */
    protected function sendResponse(mixed $data = null, string $message = 'Success', int $statusCode = 200): JsonResponse
    {
        $response = [
            'success' => true,
            'message' => $message,
            'data' => $data,
        ];

        return response()->json($response, $statusCode);
    }

    /**
     * Send an error JSON response.
     */
    protected function sendError(string $message = 'Error', mixed $errors = [], int $statusCode = 400): JsonResponse
    {
        $response = [
            'success' => false,
            'message' => $message,
            'errors' => is_array($errors) ? $errors : [$errors],
        ];

        return response()->json($response, $statusCode);
    }
}
