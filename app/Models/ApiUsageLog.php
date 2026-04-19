<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'user_id',
    'provider',
    'service',
    'model',
    'prompt_tokens',
    'completion_tokens',
    'total_tokens',
    'estimated_cost_usd',
    'http_status',
    'succeeded',
    'error_code',
    'error_message',
    'meta',
])]
class ApiUsageLog extends Model
{
    protected function casts(): array
    {
        return [
            'meta' => 'array',
            'succeeded' => 'boolean',
            'estimated_cost_usd' => 'decimal:6',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
