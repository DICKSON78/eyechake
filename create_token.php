<?php echo "\App\Models\User::find(1)->tokens()->create(["name" => "api-token", "abilities" => ["*"]])->plainTextToken;";
