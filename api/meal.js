// /api/meal.js
// NEIS 급식 정보를 서버 쪽에서 대신 호출하는 프록시.
// 브라우저에는 절대 API 키가 노출되지 않고, Vercel 환경변수(NEIS_API_KEY)만 사용합니다.

module.exports = async (req, res) => {
  const { ATPT_OFCDC_SC_CODE, SD_SCHUL_CODE, MLSV_YMD } = req.query;

  if (!ATPT_OFCDC_SC_CODE || !SD_SCHUL_CODE || !MLSV_YMD) {
    return res.status(400).json({
      RESULT: { CODE: 'ERROR-QUERY', MESSAGE: 'ATPT_OFCDC_SC_CODE, SD_SCHUL_CODE, MLSV_YMD 파라미터가 모두 필요합니다.' }
    });
  }

  const NEIS_API_KEY = process.env.NEIS_API_KEY;

  if (!NEIS_API_KEY) {
    return res.status(500).json({
      RESULT: { CODE: 'ERROR-CONFIG', MESSAGE: '서버에 NEIS_API_KEY 환경변수가 설정되어 있지 않습니다.' }
    });
  }

  const url = `https://open.neis.go.kr/hub/mealServiceDietInfo?KEY=${NEIS_API_KEY}&Type=json&pIndex=1&pSize=10&ATPT_OFCDC_SC_CODE=${encodeURIComponent(ATPT_OFCDC_SC_CODE)}&SD_SCHUL_CODE=${encodeURIComponent(SD_SCHUL_CODE)}&MLSV_YMD=${encodeURIComponent(MLSV_YMD)}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(502).json({
      RESULT: { CODE: 'ERROR-UPSTREAM', MESSAGE: 'NEIS 서버 호출 중 오류가 발생했습니다.' }
    });
  }
};
