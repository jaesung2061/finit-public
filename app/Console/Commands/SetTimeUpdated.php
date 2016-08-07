<?php namespace Finit\Console\Commands;

use Illuminate\Console\Command;

class SetTimeUpdated extends Command {
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'finit:tasks:set-updated-time';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Set updated time for breaking cache on production server.';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return mixed
     */
    public function handle()
    {
        $handle = fopen(base_path('lastupdated.txt'), 'w');
        fwrite($handle, time());
        $this->info("lastupdated.txt has been updated.");
    }
}
