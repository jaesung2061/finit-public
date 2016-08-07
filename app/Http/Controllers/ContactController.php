<?php namespace Finit\Http\Controllers;

use Carbon\Carbon;
use Dingo\Api\Http\Request;
use Finit\Http\Requests;
use Mail;

class ContactController extends Controller {
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function contact(Request $request)
    {
        $this->validate($request, [
            'email' => 'required|email|max:255',
            'name'  => 'max:255',
            'body'  => 'required|max:10000',
        ]);

        $data = $request->only(['email', 'name', 'body']);
        $data['date'] = Carbon::now()->format('F j, Y, g:i a');

        Mail::send('emails.contact', $data, function ($m) use ($request) {
            $m->from('noreply@finit.co', 'Finit Contact Form');

            $m->to('jeffyeon@finit.co')->subject('Message from Finit contact form');
        });
    }
}
