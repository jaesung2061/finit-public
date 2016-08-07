<?php namespace Finit\Console\Commands;

use Illuminate\Console\Command;
use File;

class AngularToast extends Command {
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'ng:toast {name}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a new toast in angular/toast';

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
        $name = $this->argument('name');
        $studly_name = studly_case($name);
        $human_readable = ucfirst(str_replace('_', ' ', $name));

        $html = file_get_contents(__DIR__ . '/Stubs/AngularToast/toast.html.stub');
        $js = file_get_contents(__DIR__ . '/Stubs/AngularToast/toast.js.stub');
        $scss = file_get_contents(__DIR__ . '/Stubs/AngularToast/toast.scss.stub');

        $html = str_replace('{{StudlyName}}', $studly_name, $html);
        $js = str_replace('{{StudlyName}}', $studly_name, $js);
        $html = str_replace('{{HumanReadableName}}', $human_readable, $html);
        $html = str_replace('{{DirectiveName}}', $name, $html);
        $scss = str_replace('{{DirectiveName}}', $name, $scss);

        $folder = __DIR__ . '/../../../angular/toasts/' . $name;
        if (is_dir($folder))
        {
            $this->info('Folder already exists');

            return false;
        }

        //create folder
        File::makeDirectory($folder, 0775, true);

        //create view (.html)
        File::put($folder . '/' . $name . '.html', $html);

        //create controller (.js)
        File::put($folder . '/' . $name . '.js', $js);

        //create scss file (.scss)
        File::put($folder . '/' . $name . '.scss', $scss);

        $this->info('Toast created successfully.');
    }
}
