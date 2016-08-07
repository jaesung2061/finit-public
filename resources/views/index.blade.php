<!--
 .----------------.  .----------------.  .-----------------. .----------------.  .----------------.
| .--------------. || .--------------. || .--------------. || .--------------. || .--------------. |
| |  _________   | || |     _____    | || | ____  _____  | || |     _____    | || |  _________   | |
| | |_   ___  |  | || |    |_   _|   | || ||_   \|_   _| | || |    |_   _|   | || | |  _   _  |  | |
| |   | |_  \_|  | || |      | |     | || |  |   \ | |   | || |      | |     | || | |_/ | | \_|  | |
| |   |  _|      | || |      | |     | || |  | |\ \| |   | || |      | |     | || |     | |      | |
| |  _| |_       | || |     _| |_    | || | _| |_\   |_  | || |     _| |_    | || |    _| |_     | |
| | |_____|      | || |    |_____|   | || ||_____|\____| | || |    |_____|   | || |   |_____|    | |
| |              | || |              | || |              | || |              | || |              | |
| '--------------' || '--------------' || '--------------' || '--------------' || '--------------' |
 '----------------'  '----------------'  '----------------'  '----------------'  '----------------'
-->
<!--[if lte IE 10]>
<script type="text/javascript">document.location.href = '/unsupported-browser'</script>
<![endif]-->
<!doctype html>
<html ng-app="app" ng-controller="ApplicationController" ft-globals>
    <head>
        @include('js-globals')
        @include('styles')
        @include('meta')
        @include('vendor')
        <base href="/">
    </head>
    <body layout="row" class="@{{ darkThemeEnabled ? 'dark-theme-enabled' : '' }}" style="overflow-x: hidden;">
        <!-- Sidenav component -->
        <md-sidenav class="Sidebar md-sidenav-left md-whiteframe-z2" md-component-id="left"
                    md-is-locked-open="$mdMedia('gt-md')" tabindex="-1">
            <!-- Sidebar header/branding -->
            <md-toolbar class="Sidebar-header" ng-if="currentUser">
                <a ui-sref="app.profile({username: currentUser.username})" class="Sidebar-profile-link">
                    <img class="img-responsive" ng-src="@{{currentUser.picture_sm}}" alt>
                    <span class="Sidebar-user-name" ng-bind="currentUser.username"></span>
                </a>
            </md-toolbar>

            <!-- Sidebar menu items -->
            <md-content ui-view="sidebar" ng-controller="SidebarCtrl" class="Sidebar-pages"></md-content>
        </md-sidenav>

        <md-content flex role="main" layout="column" tabindex="-1">
            <md-toolbar class="Header md-accent md-whiteframe-z1" layout="column" ng-controller="HeaderCtrl">
                <div ui-view="header"></div>
            </md-toolbar>
            <div layout="column" class="wrapper" flex>
                <div ui-view="main" flex layout="column" class="Page fadeInUp" ng-class="{center: $mdSidenavLeft.isOpen()}"></div>
            </div>
        </md-content>

        @include('js')

        {{--livereload--}}
        @if ( Config::get('app.debug') && App::isLocal() )
            <script type="text/javascript">
                $.getScript(location.protocol + '//' + location.hostname + ':35729/livereload.js?snipver=1');
            </script>
        @endif
    </body>
</html>