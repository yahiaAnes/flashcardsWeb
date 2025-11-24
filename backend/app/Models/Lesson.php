<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Lesson extends Model
{
    use HasFactory;
    protected $fillable = ['name', 'user_id'];

    public function flashcards()
    {
        return $this->hasMany(Flashcard::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
