<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<meta name="mobile-web-app-capable" content="yes">
<meta http-equiv="content-type" content="text/html;charset=utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
<meta name="keywords" content="finit, hashtag, chat, tweet, twitter, social, online, community">
<meta name="msvalidate.01" content="00AE561987224091E028328EAFD1AB19">

@if(isset($chatroom))
    @if($chatroom->tab_title)
        <title id="metadata_title">{{$chatroom->tab_title}}</title>
    @else
        <title id="metadata_title">Finit - Hashtag Chatting</title>
    @endif
    @if($chatroom->description_short)
        <meta id="metadata_description" name="description" content="{{$chatroom->description_short}} | Find a #hashtag of whatever you love - music, sports, games - and join the party. Add friends, invite them to your favorite #hashtags and enjoy or host private chat rooms within your social network.">
    @else
        <meta id="metadata_description" name="description" content="Find a #hashtag of whatever you love - music, sports, games - and join the party. Add friends, invite them to your favorite #hashtags and enjoy or host private chat rooms within your social network.">
    @endif
@else
    <title id="metadata_title">Finit - Hashtag Chatting</title>
    <meta id="metadata_description" name="description" content="Find a #hashtag of whatever you love - music, sports, games - and join the party. Add friends, invite them to your favorite #hashtags and enjoy or host private chat rooms within your social network.">
@endif

{{--Favicons --}}
<link rel="apple-touch-icon" sizes="57x57" href="/apple-touch-icon-57x57.png?{{$version}}">
<link rel="apple-touch-icon" sizes="60x60" href="/apple-touch-icon-60x60.png?{{$version}}">
<link rel="apple-touch-icon" sizes="72x72" href="/apple-touch-icon-72x72.png?{{$version}}">
<link rel="apple-touch-icon" sizes="76x76" href="/apple-touch-icon-76x76.png?{{$version}}">
<link rel="apple-touch-icon" sizes="114x114" href="/apple-touch-icon-114x114.png?{{$version}}">
<link rel="apple-touch-icon" sizes="120x120" href="/apple-touch-icon-120x120.png?{{$version}}">
<link rel="apple-touch-icon" sizes="144x144" href="/apple-touch-icon-144x144.png?{{$version}}">
<link rel="apple-touch-icon" sizes="152x152" href="/apple-touch-icon-152x152.png?{{$version}}">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon-180x180.png?{{$version}}">
<link rel="icon" type="image/png" href="/favicon-32x32.png?{{$version}}" sizes="32x32">
<link rel="icon" type="image/png" href="/android-chrome-192x192.png?{{$version}}" sizes="192x192">
<link rel="icon" type="image/png" href="/favicon-96x96.png?{{$version}}" sizes="96x96">
<link rel="icon" type="image/png" href="/favicon-16x16.png?{{$version}}" sizes="16x16">
<link rel="manifest" href="/manifest.json">
<link rel="mask-icon" href="/safari-pinned-tab.svg" color="#5bbad5">
<meta name="msapplication-TileColor" content="#65aeff">
<meta name="msapplication-TileImage" content="/mstile-144x144.png?{{$version}}">
<meta name="theme-color" content="#ffffff">
