(function () {
    "use strict";

    angular.module('app.routes')
        .config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
            $locationProvider.html5Mode(true);

            $urlRouterProvider.otherwise('/login');

            $stateProvider
                .state('app', {
                    abstract: true,
                    views: {
                        sidebar: {
                            templateUrl: getView('sidebar')
                        },
                        header: {
                            templateUrl: getView('header')
                        },
                        main: {}
                    },
                    data: {authorization: 'all'}
                })
                .state('app.home', {
                    url: '/',
                    data: generateStateData('all'),
                    views: {
                        'main@': {
                            templateUrl: getView('chat')
                        }
                    }
                })
                .state('app.error', {
                    url: '/oops',
                    params: {
                        message: null
                    },
                    data: generateStateData('all'),
                    views: {
                        'main@': {
                            templateUrl: getView('error')
                        }
                    }
                })
                .state('app.privacy', {
                    url: '/privacy',
                    data: generateStateData('all'),
                    views: {
                        'main@': {
                            templateUrl: getView('privacy-policy')
                        }
                    }
                })
                .state('app.about', {
                    url: '/about',
                    data: generateStateData('all', 'About us', 'What is Finit? Here is a quick overview of this fun website!'),
                    views: {
                        'main@': {
                            templateUrl: getView('about')
                        }
                    }
                })
                .state('app.site-map', {
                    url: '/site-map',
                    data: generateStateData('all', 'The Site Map for Finit'),
                    views: {
                        'main@': {
                            templateUrl: getView('site-map')
                        }
                    }
                })
                .state('app.contact', {
                    url: '/contact',
                    data: generateStateData('all', 'Contact Us', 'If you have any questions or concerns, please contact us here. You can also request to claim a hashtag that is already claimed here.'),
                    views: {
                        'main@': {
                            templateUrl: getView('contact')
                        }
                    }
                })
                .state('app.updates', {
                    url: '/updates',
                    data: generateStateData('all', 'Updates and Changes Log', 'Finit is fast changing chat application. New features, bug fixes and other updates are listed here.'),
                    views: {
                        'main@': {
                            templateUrl: getView('updates')
                        }
                    }
                })
                .state('app.commands', {
                    url: '/chat-commands',
                    data: generateStateData('commands', 'Chat Commands', 'All chat commands for regular users and moderators are referenced here. Learn how to use chat commands here.'),
                    views: {
                        'main@': {
                            templateUrl: getView('chat-commands')
                        }
                    }
                })
                .state('app.claim', {
                    url: '/claim?hashtag',
                    params: {
                        hashtag: {
                            squash: true,
                            value: null
                        }
                    },
                    data: generateStateData('all', 'Claim a Hashtag', 'Claim a hashtag and grow your very own community!'),
                    views: {
                        'main@': {
                            templateUrl: getView('claim')
                        }
                    }
                })
                .state('app.create-room', {
                    url: '/create-room',
                    data: generateStateData('all', 'Create a Private Chatroom', 'Create a private chatroom for just you and your friends!'),
                    views: {
                        'main@': {
                            templateUrl: getView('create-room')
                        }
                    }
                })
                .state('app.bug-reports', {
                    url: '/bugs',
                    data: generateStateData('all'),
                    views: {
                        'main@': {
                            templateUrl: getView('bug-reports')
                        }
                    }
                })
                .state('app.chat-rules', {
                    url: '/rules',
                    data: generateStateData('all', 'Finit Site Rules', 'Side-wide rules for Finit chatting are listed here.'),
                    views: {
                        'main@': {
                            templateUrl: getView('chat-rules')
                        }
                    }
                })
                .state('app.login', {
                    url: '/login',
                    data: generateStateData('guests', 'Sign In to Finit', 'Sign into your account and access all features.'),
                    views: {
                        'main@': {
                            templateUrl: getView('login')
                        }
                    }
                })
                .state('app.register', {
                    url: '/register',
                    data: generateStateData('guests', 'Create an Account for Finit', 'Finit is a free chat application, and will always be free.'),
                    views: {
                        'main@': {
                            templateUrl: getView('register')
                        }
                    }
                })
                .state('app.chat', {
                    url: '/chat',
                    data: generateStateData('all'),
                    views: {
                        'main@': {
                            templateUrl: getView('chat')
                        }
                    }
                })
                .state('app.chat.show', {
                    url: '/:title',
                    data: generateStateData('auth'),
                    views: {
                        'main@': {
                            templateUrl: getView('chat.show')
                        }
                    }
                })
                .state('app.chat.show.polls', {
                    url: '/polls',
                    data: generateStateData('auth'),
                    views: {
                        'main@': {
                            templateUrl: getView('polls')
                        }
                    }
                })
                .state('app.chat.show.dashboard', {
                    url: '/dashboard',
                    data: generateStateData('auth'),
                    views: {
                        'main@': {
                            templateUrl: getView('dashboard')
                        }
                    }
                })
                .state('app.users', {
                    url: '/users',
                    data: generateStateData('auth'),
                    views: {
                        'main@': {
                            templateUrl: getView('users')
                        }
                    }
                })
                .state('app.settings', {
                    url: '/settings',
                    data: generateStateData('auth'),
                    views: {
                        'main@': {
                            templateUrl: getView('settings')
                        }
                    }
                })
                .state('app.profile', {
                    url: '/@{username}',
                    data: generateStateData('auth'),
                    views: {
                        'main@': {
                            templateUrl: getView('users.show')
                        }
                    }
                })
                .state('app.forgot-password', {
                    url: '/forgot-password',
                    data: generateStateData('all', 'Reset Your Password'),
                    views: {
                        'main@': {
                            templateUrl: getView('forgot-password')
                        }
                    }
                })
                .state('app.forgot-password-reset', {
                    url: '/forgot-password/reset/:token',
                    data: generateStateData('all'),
                    views: {
                        'main@': {
                            templateUrl: getView('forgot-password-reset')
                        }
                    }
                })
                .state('app.email-reset', {
                    url: '/reset/email/:token',
                    data: generateStateData('all'),
                    views: {
                        'main@': {
                            templateUrl: getView('email-reset')
                        }
                    }
                })
                .state('app.password-reset', {
                    url: '/reset/password/:token',
                    data: generateStateData('all'),
                    views: {
                        'main@': {
                            templateUrl: getView('password-reset')
                        }
                    }
                })
                .state('app.unsubscribe', {
                    url: '/unsubscribe',
                    data: generateStateData('all'),
                    views: {
                        'main@': {
                            templateUrl: getView('unsubscribe')
                        }
                    }
                });

            function getView(viewName) {
                return './views/app/' + viewName + '/' + viewName + '.html?' + Finit.version;
            }

            function generateStateData(authorization, metadataTitle, metadataDescription) {
                var title, description;

                if (!metadataTitle) {
                    title = 'Finit - Hashtag Chatting';
                } else {
                    title = metadataTitle + ' | Finit - Hashtag Chatting'
                }

                if (!metadataDescription) {
                    description = 'Find a #hashtag of whatever you love - music, sports, games - and join the party. Add friends, invite them to your favorite #hashtags and enjoy or host private chat rooms within your social network.';
                } else {
                    description = metadataDescription;
                }

                return {
                    authorization: authorization || 'all',
                    metadata: {
                        title: title,
                        description: description
                    }
                };
            }
        });

})();
