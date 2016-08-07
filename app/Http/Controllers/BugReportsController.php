<?php namespace Finit\Http\Controllers;

use Dingo\Api\Http\Request;
use Finit\Http\Requests;
use Finit\Models\BugReport;
use Illuminate\Support\Facades\Auth;

class BugReportsController extends Controller {
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        return response()->api(BugReport::all()->toArray());
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Dingo\Api\Http\Request $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $this->validate($request, [
            'body' => 'required|max:255'
        ]);

        try
        {
            $this->authenticateUser();
            $userId = Auth::user()->id;
        }
        catch (\Exception $e)
        {
            $userId = 0;
        }

        $bugReport = BugReport::create([
            'reporter_id' => $userId,
            'body'        => $request->get('body')
        ]);

        return response()->api($bugReport->toArray());
    }

    /**
     * Display the specified resource.
     *
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request $request
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }
}
