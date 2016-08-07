{!! '<?xml version="1.0" encoding="UTF-8"?>' !!}
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
    <url>
        <loc>https://finit.co/about</loc>
    </url>
    <url>
        <loc>https://finit.co/contact</loc>
    </url>
    <url>
        <loc>https://finit.co/updates</loc>
    </url>
    <url>
        <loc>https://finit.co/claim</loc>
    </url>
    <url>
        <loc>https://finit.co/privacy</loc>
    </url>
    <url>
        <loc>https://finit.co/site-map</loc>
    </url>
    <url>
        <loc>https://blog.finit.co/</loc>
    </url>
    @foreach($chatrooms as $chatroom)
        <url>
            <loc>https://finit.co/chat/{{substr($chatroom->channel, 4)}}</loc>
            <lastmod>{{$chatroom->updated_at->format('Y-m-d')}}</lastmod>
            @if($chatroom->image)
                <image:image>
                    <image:loc>{{$chatroom->image}}</image:loc>
                    <image:caption>Finit - Hashtag Chatting</image:caption>
                </image:image>
            @endif
        </url>
    @endforeach
</urlset>