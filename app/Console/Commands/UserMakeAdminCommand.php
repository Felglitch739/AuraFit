<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class UserMakeAdminCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'user:admin
                            {identifier : User ID or email}
                            {--revoke : Revoke admin access instead of granting it}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Grant or revoke admin access for an existing user';

    public function handle(): int
    {
        $identifier = (string) $this->argument('identifier');
        $revoke = (bool) $this->option('revoke');

        $user = User::query()
            ->when(
                is_numeric($identifier),
                fn ($query) => $query->where('id', (int) $identifier),
                fn ($query) => $query->where('email', $identifier),
            )
            ->first();

        if (! $user) {
            $this->error('User not found. Provide a valid ID or email.');

            return self::FAILURE;
        }

        $user->is_admin = ! $revoke;
        $user->save();

        $this->info(sprintf(
            'User %s (%s) is now %s.',
            $user->name,
            $user->email,
            $user->is_admin ? 'ADMIN' : 'NON-ADMIN',
        ));

        return self::SUCCESS;
    }
}
