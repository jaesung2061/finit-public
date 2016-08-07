<?php namespace Finit\Console\Commands;

use Finit\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class EmailMembersToComeBack extends Command {
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'finit:email:back';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Email members to come back and use the website.';

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
        $usersToEmail = User::select(['id', 'username', 'email'])->where('is_temp', 0)->where('subscribed', 1)->get();

        $user = User::whereUsername('PresidentObama')->first();

        Mail::send('emails.request-back', ['user' => $user], function ($m) use ($user)
        {
            $m->from('jeffyeon@finit.co', 'Jeff Yeon');
            $m->to($user->email)->subject('Hello there, come back and check out the community we\'ve built!');
        });

        foreach ($usersToEmail as $user)
        {
            Mail::send('emails.request-back', ['user' => $user], function ($m) use ($user)
            {
                $m->from('jeffyeon@finit.co', 'Jeff Yeon');
                $m->to($user->email)->subject('Hello there, come back and check out the community we\'ve built!');
            });

            echo "Emailed to $user->email \n";
        }
        echo "Count: " . count($usersToEmail);
    }
}
