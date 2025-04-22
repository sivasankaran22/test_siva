<?php
$text = "the quick brown fox jumps over the lazy dog the lazy dog jumps over the quick brown fox";

// Tokenize the text
$words = explode(" ", $text);

// Create a Markov chain (word pairs)
$markovChain = [];
for ($i = 0; $i < count($words) - 1; $i++) {
    $markovChain[$words[$i]][] = $words[$i + 1];
}

// Generate text based on the Markov chain
$startWord = "the";
$generatedText = $startWord;

for ($i = 0; $i < 50; $i++) {
    $nextWord = $markovChain[$startWord][array_rand($markovChain[$startWord])];
    $generatedText .= " " . $nextWord;
    $startWord = $nextWord;
}

echo "Generated Text: " . $generatedText;
?>
