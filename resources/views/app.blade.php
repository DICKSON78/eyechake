<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>{{ env('APP_NAME') }}</title>

    <link href="{{ \Illuminate\Support\Facades\URL::to('/') . '/css/fonts.css' }}" rel="stylesheet">

    @viteReactRefresh
    @vite(['resources/js/app.jsx'])
</head>
<body>
<noscript>You need to enable JavaScript to run this app.</noscript>
<div id="root"></div>
</body>
</html>
