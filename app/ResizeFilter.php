<?php namespace Finit;

use Intervention\Image\Filters\FilterInterface;
use Intervention\Image\Image;

class ResizeFilter implements FilterInterface {

    /**
     * @var
     */
    protected $size;

    /**
     * @param int $size
     */
    public function __construct($size = 512)
    {
        $this->size = $size;
    }

    /**
     * Resize the image to 512x512 and keep aspect ratio
     *
     * @param Image $img
     * @return void
     */
    public function applyFilter(Image $img)
    {
        if ($img->width() > $this->size || $img->height() > $this->size)
        {
            if ($img->width() > $this->size)
                $img->resize($this->size, null, function ($constraint)
                    {$constraint->aspectRatio();});
            if ($img->height() > $this->size)
                $img->resize(null, $this->size, function ($constraint)
                    {$constraint->aspectRatio();});
        }
        else
        {
            if ($img->width() > $img->height())
                $img->resize($this->size, null, function ($constraint)
                    {$constraint->aspectRatio();});
            else
                $img->resize(null, $this->size, function ($constraint)
                    {$constraint->aspectRatio();});
        }
    }

}