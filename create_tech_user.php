<?php>

$user = \App\Models\User::where('username', 'zeus')->first();
if (!$user) {
    $user = \App\Models\User::create([
        'username'   => 'zeus',
        'password'   => bcrypt('zeus'),
        'first_name' => 'Tech',
        'last_name'  => 'Admin',
        'role'       => 'Admin',
        'status'     => 'Active',
    ]);
    echo 'User created with ID: ' . $user->id . PHP_EOL;
} else {
    echo 'User already exists with ID: ' . $user->id . PHP_EOL;
}

\App\Models\UserPrivilege::updateFromArray($user->id, \App\Models\UserPrivilege::$availablePrivileges);
echo 'All privileges assigned successfully.' . PHP_EOL;
