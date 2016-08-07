<?php namespace Finit\Console\Commands;

use App;
use Finit\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;

class EmailBlast extends Command {
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'finit:email:blast';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send out an email blast.';

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
        $view = 'emails.blast';
        $title = 'You can now claim hashtags!';

        if (App::environment('local'))
        {
            $this->sendOutFakeEmail($view, $title);
        }
        else if (App::environment('production'))
        {
            $this->sendOutRealEmails($view, $title);
        }
    }

    /**
     * For testing
     * @param $view
     * @param $title
     */
    private function sendOutFakeEmail($view, $title)
    {
        $this->sendMail($view, $title, ['jeffyeon2061@gmail.com', 'jeffyeon2061@yahoo.com']);
    }

    /**
     * Actual email blast
     * @param $view
     * @param $title
     */
    private function sendOutRealEmails($view, $title)
    {
        $usersToEmail = User::select(['id', 'username', 'email'])->where('is_temp', 0)->where('subscribed', 1)->lists('email');

        $this->sendMail($view, $title, $usersToEmail->toArray());

        echo "Emails sent: " . count($usersToEmail);
    }

    /**
     * @param $view
     * @param $title
     * @param $emails
     */
    private function sendMail($view, $title, $emails)
    {
        Mail::send($view, [], function ($m) use ($emails, $title)
        {
            $m->from('jeffyeon@finit.co', 'Jeff Yeon');
            $m->to($emails)->subject($title);
        });

        if (is_array($emails))
        {
            echo "Sent email to:\n";

            foreach ($emails as $e)
            {
                echo $e . PHP_EOL;
            }
        }
        else
        {
            echo "Emails sent\n";
        }
    }
}
