<?php

$user = \App\Models\User::where('username', 'tech')->first();
if (!$user) {
    $user = \App\Models\User::create([
        'username'   => 'tech',
        'password'   => bcrypt('tech'),
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
