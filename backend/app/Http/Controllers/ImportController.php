<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Imports\RuleImport;
use Maatwebsite\Excel\Facades\Excel;

class ImportController extends Controller
{
    public function ImportRules(Request $request) {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv',
        ]);

        Excel::import(new RuleImport, $request->file('file'));

        return response(['message' => 'File imported successfully.'], 200);
    }
}
