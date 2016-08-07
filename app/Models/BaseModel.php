<?php namespace Finit\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use ReflectionClass;

class BaseModel extends Model {
    /**
     * Get all columns for model
     *
     * @return array
     */
    public function getAllColumnsNames()
    {
        $query = 'SHOW COLUMNS FROM ' . $this->getTable();
        $column_name = 'Field';

        $columns = [];

        foreach (DB::select($query) as $column)
        {
            $columns[] = $column->$column_name;
        }

        return $columns;
    }

    /**
     * Check if column exists
     *
     * @param $column
     * @return bool
     */
    public function columnExists($column)
    {
        $columns = $this->getAllColumnsNames();

        foreach ($columns as $c)
        {
            if ($c === $column)
            {
                return true;
            }
        }

        return false;
    }

    /**
     * @return array
     */
    public static function getConstants()
    {
        $oClass = new ReflectionClass(static::class);

        $constants = $oClass->getConstants();

        unset($constants['CREATED_AT']);
        unset($constants['UPDATED_AT']);

        return $constants;
    }
}
