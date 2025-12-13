<?php
// AI 질의용 PHP 엔드포인트 (Groq API 사용)
// 요구사항:
// - Groq API 사용 (Llama 3.1 70B 또는 Mixtral-8x7b-32768)
// - PHP에서 cURL 사용
// - API 키는 환경 변수 GROQ_API_KEY 에 설정 (예: export GROQ_API_KEY="gsk_...")
// - Groq는 매우 빠른 추론 속도를 제공하며 무료 티어가 있습니다.

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'POST 메서드만 지원합니다.']);
    exit;
}

// 요청 파라미터 읽기
$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) {
    echo json_encode(['error' => '잘못된 요청 형식입니다. JSON 형태로 전송해주세요.']);
    exit;
}

$question = isset($data['question']) ? trim($data['question']) : '';
$year = isset($data['year']) ? $data['year'] : null;
$version = isset($data['version']) ? $data['version'] : null;
$budgetData = isset($data['budgetData']) ? $data['budgetData'] : null;
$summary = isset($data['summary']) ? $data['summary'] : null;

if ($question === '') {
    echo json_encode(['error' => '질문이 비어 있습니다.']);
    exit;
}

$apiKey = getenv('GROQ_API_KEY');
if (!$apiKey) {
    http_response_code(500);
    echo json_encode(['error' => 'GROQ_API_KEY 환경 변수가 설정되어 있지 않습니다. 서버 환경 변수에 Groq API 키를 설정해주세요.']);
    exit;
}

// 프롬프트 구성
$systemPrompt = <<<EOT
당신은 충남정보문화산업진흥원의 예산 분석을 도와주는 전문가입니다.
사용자는 연도별/회차별(본예산, 1차·2차·3차 추경 등) 국비/도비/시군비/자체 예산을 관리합니다.
질문을 이해하고, 한국어로 친절하고 간결하게 답변하세요.
수치는 가능하면 억원 단위로 요약하고, 필요한 경우 표 형식(마크다운 표)으로 정리해도 됩니다.
EOT;

$userContext = "분석 기준 연도: " . ($year ?: '미지정') . "년\n" .
               "예산 회차: " . ($version ?: '미지정') . "\n\n";

// 예산 데이터가 있으면 추가
if ($summary && is_array($summary)) {
    $userContext .= "예산 요약:\n";
    $userContext .= "- 총 예산: " . number_format($summary['total'] ?? 0) . "원\n";
    $userContext .= "- 국비: " . number_format($summary['national'] ?? 0) . "원\n";
    $userContext .= "- 도비: " . number_format($summary['provincial'] ?? 0) . "원\n";
    $userContext .= "- 시군비: " . number_format($summary['cityCounty'] ?? 0) . "원\n";
    $userContext .= "- 자체재원: " . number_format($summary['self'] ?? 0) . "원\n\n";
}

if ($budgetData && is_array($budgetData) && count($budgetData) > 0) {
    $userContext .= "주요 예산 항목 (상위 " . min(10, count($budgetData)) . "개):\n";
    foreach (array_slice($budgetData, 0, 10) as $idx => $item) {
        $userContext .= ($idx + 1) . ". " . ($item['projectName'] ?? '') . ": " . 
                       number_format($item['totalAmount'] ?? 0) . "원 (" . 
                       ($item['department'] ?? '') . ")\n";
    }
    $userContext .= "\n";
}

$userContext .= "질문:\n" . $question;

// Groq API는 llama-3.1-70b-versatile 또는 mixtral-8x7b-32768 모델 사용
// 빠른 응답을 위해 mixtral-8x7b-32768 사용 (더 빠름)
$model = isset($data['model']) ? $data['model'] : 'mixtral-8x7b-32768';

$payload = [
    'model' => $model,
    'messages' => [
        ['role' => 'system', 'content' => $systemPrompt],
        ['role' => 'user', 'content' => $userContext],
    ],
    'temperature' => 0.2,
    'max_tokens' => 2048,
];

$ch = curl_init('https://api.groq.com/openai/v1/chat/completions');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $apiKey,
]);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));

$response = curl_exec($ch);
if ($response === false) {
    $error = curl_error($ch);
    curl_close($ch);
    http_response_code(500);
    echo json_encode(['error' => 'Groq API 호출 실패: ' . $error]);
    exit;
}

$statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$result = json_decode($response, true);

if ($statusCode >= 400) {
    $message = isset($result['error']['message']) ? $result['error']['message'] : '알 수 없는 오류';
    http_response_code($statusCode);
    echo json_encode(['error' => 'Groq 오류: ' . $message]);
    exit;
}

$answer = $result['choices'][0]['message']['content'] ?? '';

echo json_encode([
    'success' => true,
    'answer' => $answer,
    'model' => $model,
    'usage' => $result['usage'] ?? null,
]);

