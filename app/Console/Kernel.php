<?php

namespace Finit\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel {
    /**
     * The Artisan commands provided by your application.
     *
     * @var array
     */
    protected $commands = [
        'Finit\Console\Commands\Inspire',
        'Finit\Console\Commands\AngularFeature',
        'Finit\Console\Commands\AngularDialog',
        'Finit\Console\Commands\AngularDirective',
        'Finit\Console\Commands\AngularService',
        'Finit\Console\Commands\AngularFilter',
        'Finit\Console\Commands\AngularConfig',
        'Finit\Console\Commands\AngularToast',
        'Finit\Console\Commands\CreateModerator',
//        'Finit\Console\Commands\EmailMembersToComeBack',
        'Finit\Console\Commands\EmailBlast',
        'Finit\Console\Commands\SetTimeUpdated',
    ];

    /**
     * Define the application's command schedule.
     *
     * @param  \Illuminate\Console\Scheduling\Schedule $schedule
     * @return void
     */
    protected function schedule(Schedule $schedule)
    {
        $schedule->command('inspire')
            ->hourly();
    }
}
