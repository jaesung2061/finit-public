<html>
    <head>
        <link href='//fonts.googleapis.com/css?family=Lato:100' rel='stylesheet' type='text/css'>
        <link href='//maxcdn.bootstrapcdn.com/bootstrap/3.3.6/css/bootstrap.min.css' rel='stylesheet' type='text/css'>
        @include('meta')
        <style>
            body {
                margin: 0;
                padding: 0;
                width: 100%;
                height: 100%;
                color: #B0BEC5;
                display: table;
                font-weight: 100;
                font-family: 'Lato';
            }

            .container {
                text-align: center;
                display: table-cell;
                vertical-align: middle;
            }

            .content {
                text-align: center;
                display: inline-block;
                position: relative;
                top: -100px;
            }

            .title {
                font-size: 72px;
                margin-bottom: 40px;
            }
            form {
                max-width: 500px;
                margin: 0 auto;
            }
            button {
                /*background: #fff;*/
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="content">
                <div class="title">Enter Site Key</div>

                <form method="POST" action="/api/key">
                    <div class="input-group">
                        <input type="text" class="form-control" placeholder="Key" name="key">
                        <span class="input-group-btn">
                            <button class="btn btn-default" type="submit">Enter</button>
                        </span>
                    </div>
                </form>
            </div>
        </div>
    </body>
</html>
