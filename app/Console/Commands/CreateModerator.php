<?php

namespace Finit\Console\Commands;

use Finit\Models\Moderator;
use Finit\Models\User;
use Illuminate\Console\Command;

class CreateModerator extends Command {
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'finit:moderator:create {identifier} {channel}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Creat a mod.';

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
        $user = User::find($this->argument('identifier'));

        if (!$user)
        {
            $user = User::where('username', $this->argument('identifier'))->first();
        }

        if (!$user)
        {
            $this->error('Couldn\'t find user.');
            return;
        }

        $mod = Moderator::firstOrCreate([
            'user_id' => $user->id,
            'channel' => $this->argument('channel')
        ]);

        $mod->approved = 1;

        $mod->save();

        $this->info('Moderator power given to ' . $user->username . '.');
    }
}
