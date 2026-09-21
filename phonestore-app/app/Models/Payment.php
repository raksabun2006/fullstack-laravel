<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    use HasFactory;

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'order_id',
        'user_id',
        'amount',
        'currency',
        'method',
        'status',
        'transaction_ref',
        'transaction_id',
        'transaction_hash',
        'khqr',
        'md5',
        'paid_at',
        'expires_at',
        'failure_reason',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'paid_at' => 'datetime',
        'expires_at' => 'datetime',
    ];

    protected $appends = [
        'customer',
        'payment_method',
        'payment_status',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_id', 'id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function getCustomerAttribute(): ?array
    {
        $user = $this->user ?: $this->order?->user;
        if (! $user) {
            return null;
        }

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
        ];
    }

    public function getPaymentMethodAttribute(): ?string
    {
        return $this->attributes['method'] ?? null;
    }

    public function setPaymentMethodAttribute(?string $value): void
    {
        $this->attributes['method'] = $value;
    }

    public function getPaymentStatusAttribute(): ?string
    {
        return $this->attributes['status'] ?? null;
    }

    public function setPaymentStatusAttribute(?string $value): void
    {
        $this->attributes['status'] = $value;
    }
}
