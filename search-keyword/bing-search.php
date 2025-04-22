<?php
function searchBing($query) {
    $url = "https://www.bing.com/search?q=" . urlencode($query);

    // Initialize cURL
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_USERAGENT, "Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
    $response = curl_exec($ch);
    curl_close($ch);
//var_dump($response);
    // Extract titles and links using regex
    preg_match_all('/<a href="(.*?)".*?>(.*?)<\/a>/is', $response, $matches);
	//var_dump($matches);
    $results = [];
    if (!empty($matches[1])) {
        foreach ($matches[1] as $index => $link) {
            $results[] = [
                'title' => strip_tags($matches[2][$index]),
                'url' => $link,
            ];
        }
    }
    return $results;
}

$keyword = "SEO best practices";
$results = searchBing($keyword);

if (!empty($results)) {
    echo "Search Results:\n";
    foreach ($results as $result) {
        echo "Title: " . $result['title'] . "\n";
        echo "URL: " . $result['url'] . "\n\n";
    }
} else {
    echo "No results found or an error occurred.\n";
}
?>
