<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\UserPrivilege;

class VerifyTechUser extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tech:verify';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Verify tech user setup and credentials';

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $this->info('=== VERIFYING TECH USER ===');
        $this->newLine();
        
        $techUser = User::where('username', 'tech')->first();
        
        if (!$techUser) {
            $this->error('❌ Tech user not found!');
            $this->info('Run: php artisan db:seed --class=CreateTechUserSeeder');
            return 1;
        }
        
        $this->info("✅ Tech user found:");
        $this->info("   ID: {$techUser->id}");
        $this->info("   Name: {$techUser->first_name} {$techUser->last_name}");
        $this->info("   Username: {$techUser->username}");
        $this->info("   Email: {$techUser->email}");
        $this->info("   Role: {$techUser->role}");
        $this->info("   Status: {$techUser->status}");
        $this->info("   Clinic ID: " . ($techUser->clinic_id ?? 'NULL'));
        $this->newLine();
        
        // Check privileges
        $privilegeCount = UserPrivilege::where('user_id', $techUser->id)->count();
        $this->info("Privileges: {$privilegeCount}");
        
        $hasDashboard = UserPrivilege::where('user_id', $techUser->id)
            ->where('privilege', 'dashboard')
            ->exists();
        
        if ($hasDashboard) {
            $this->info("✅ Dashboard privilege: YES");
        } else {
            $this->error("❌ Dashboard privilege: NO");
            $this->info("Run: php artisan tech:assign-privileges");
        }
        
        // Check password
        $this->newLine();
        $this->info("Password check:");
        if (\Hash::check('tech', $techUser->password)) {
            $this->info("✅ Password 'tech' is correct");
        } else {
            $this->error("❌ Password 'tech' is incorrect");
        }
        
        // Check clinic
        $this->newLine();
        if ($techUser->clinic) {
            $this->info("✅ Clinic: {$techUser->clinic->name}");
        } else {
            $this->warn("⚠️  Clinic: Not set (this might cause issues)");
        }
        
        $this->newLine();
        $this->info("=== VERIFICATION COMPLETE ===");
        
        return 0;
    }
}

