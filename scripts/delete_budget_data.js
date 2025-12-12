/**
 * Firestore에서 특정 연도/버전의 예산 데이터 삭제 스크립트
 * Node.js 환경에서 실행
 */

const admin = require('firebase-admin');
const serviceAccount = require('../functions/serviceAccountKey.json'); // Firebase 서비스 계정 키 경로

// Firebase 초기화
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function deleteBudgetData(year, version) {
  try {
    console.log(`\n${year}년 ${version} 예산 데이터 삭제 시작...\n`);
    
    const budgetsRef = db.collection('budgets');
    const query = budgetsRef.where('year', '==', year).where('version', '==', version);
    const snapshot = await query.get();
    
    if (snapshot.empty) {
      console.log(`삭제할 데이터가 없습니다. (${year}년 ${version})`);
      return;
    }
    
    console.log(`삭제할 항목 수: ${snapshot.size}개`);
    
    const batch = db.batch();
    let count = 0;
    
    snapshot.forEach((doc) => {
      batch.delete(doc.ref);
      count++;
      
      // 배치 크기 제한 (500개)
      if (count % 500 === 0) {
        batch.commit();
        console.log(`${count}개 항목 삭제 중...`);
      }
    });
    
    // 남은 항목 커밋
    if (count % 500 !== 0) {
      await batch.commit();
    }
    
    console.log(`\n✅ 완료: ${count}개 항목이 삭제되었습니다.`);
  } catch (error) {
    console.error('❌ 오류:', error);
    throw error;
  }
}

// 실행
const year = 2024;
const version = '본예산';

deleteBudgetData(year, version)
  .then(() => {
    console.log('\n삭제 작업이 완료되었습니다.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('삭제 작업 실패:', error);
    process.exit(1);
  });

