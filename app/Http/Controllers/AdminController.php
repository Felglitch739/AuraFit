<?php

namespace App\Http\Controllers;

use App\Models\ApiUsageLog;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AdminController extends Controller
{
    public function index(): Response
    {
        $users = User::query()
            ->select(['id', 'name', 'email', 'is_admin', 'created_at'])
            ->orderBy('id')
            ->get()
            ->map(fn(User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'isAdmin' => (bool) $user->is_admin,
                'createdAt' => $user->created_at?->toIso8601String(),
            ]);

        $usageByUser = ApiUsageLog::query()
            ->leftJoin('users', 'users.id', '=', 'api_usage_logs.user_id')
            ->select([
                'api_usage_logs.user_id',
                DB::raw("COALESCE(users.name, 'Unknown') as user_name"),
                DB::raw("COALESCE(users.email, 'Unknown') as user_email"),
                DB::raw('COUNT(*) as requests_count'),
                DB::raw('SUM(api_usage_logs.total_tokens) as total_tokens'),
                DB::raw('SUM(api_usage_logs.estimated_cost_usd) as total_cost_usd'),
                DB::raw('MAX(api_usage_logs.created_at) as last_request_at'),
            ])
            ->groupBy('api_usage_logs.user_id', 'users.name', 'users.email')
            ->orderByDesc('requests_count')
            ->get()
            ->map(fn($row) => [
                'userId' => $row->user_id,
                'name' => $row->user_name,
                'email' => $row->user_email,
                'requestsCount' => (int) $row->requests_count,
                'totalTokens' => (int) ($row->total_tokens ?? 0),
                'totalCostUsd' => (float) ($row->total_cost_usd ?? 0),
                'lastRequestAt' => $row->last_request_at,
            ]);

        $globalUsage = ApiUsageLog::query()
            ->selectRaw('COUNT(*) as requests_count')
            ->selectRaw('SUM(total_tokens) as total_tokens')
            ->selectRaw('SUM(estimated_cost_usd) as total_cost_usd')
            ->first();

        return Inertia::render('admin/index', [
            'users' => $users,
            'usage' => [
                'totals' => [
                    'requestsCount' => (int) ($globalUsage?->requests_count ?? 0),
                    'totalTokens' => (int) ($globalUsage?->total_tokens ?? 0),
                    'totalCostUsd' => (float) ($globalUsage?->total_cost_usd ?? 0),
                ],
                'byUser' => $usageByUser,
            ],
        ]);
    }
}
