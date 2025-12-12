#!/usr/bin/env python3
"""
Excel 파일의 실제 컬럼명을 확인하는 간단한 스크립트 (openpyxl 없이)
"""
import sys
import os

# xlrd를 사용하거나, 아니면 파일을 직접 읽어서 확인
try:
    # 방법 1: xlrd 시도
    import xlrd
    file_path = 'upload/2024 본예산 기초만_1.xlsx'
    
    if not os.path.exists(file_path):
        print(f"파일을 찾을 수 없습니다: {file_path}")
        sys.exit(1)
    
    print(f"=== Excel 파일 컬럼명 확인: {file_path} ===\n")
    
    # xlrd는 .xls만 지원하므로 .xlsx는 안됨
    print("xlrd는 .xlsx 파일을 지원하지 않습니다.")
    print("openpyxl을 설치하거나, Excel에서 직접 확인해주세요.")
    
except ImportError:
    print("=== Excel 파일 컬럼명 확인 방법 ===")
    print("\n1. Excel에서 파일을 열어서 확인:")
    print("   - 1행(또는 헤더 행)의 컬럼명을 확인")
    print("   - 특히 다음 컬럼들을 확인:")
    print("     * 출연금-천안 (O열)")
    print("     * 출연금-아산 (P열)")
    print("     * 출연금-당진 (Q열)")
    print("     * 보조금-천안 (U열)")
    print("     * 보조금-아산 (V열)")
    print("     * 보조금-당진 (W열)")
    print("\n2. 또는 다음 명령어로 openpyxl 설치 후 확인:")
    print("   pip install openpyxl")
    print("   python3 check_excel_columns.py")
    
    # 간단한 안내
    print("\n=== 필터링 로직 설명 ===")
    print("현재 다음 조건에 해당하면 행이 제외됩니다:")
    print("1. 사업명에 '소계', '합계', '총계', '계', '합', '소', '총' 포함")
    print("2. 구분 컬럼에 집계 키워드 포함")
    print("3. 부서명 없고 사업명 1글자 이하")
    print("4. 사업명이 정확히 '합계:', '소계:' 등으로 시작")
    print("5. 총액 100억 이상 + 사업명 1글자 이하 + 부서명 없음")
    print("6. 사업명이 '합계'로 시작/끝나고 5글자 이하")
    print("7. 사업명이 정확히 '반환금' 또는 '예비비'")

