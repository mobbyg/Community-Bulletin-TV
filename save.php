<?php
$data = file_get_contents("php://input");

if (!$data) {
  http_response_code(400);
  exit("No data");
}

file_put_contents(__DIR__ . "/data/bulletin.json", $data);

echo "OK";
