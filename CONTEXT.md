---

# 프로젝트 컨텍스트

## 프로젝트 개요
반응형 To-Do List 웹 애플리케이션 — 일반 직장인이 업무/개인 할 일을 하나의 리스트에서 통합 관리하는 라이트모드 전용 서비스 (PRD v1.1 + 디자인 스펙 v2.1).

## 절대 규칙

- 라이트모드 전용 (다크모드 없음)
- 모든 스타일은 CSS 변수만 사용 (하드코딩 금지)
- CSS 변수 네이밍: --[카테고리]-[속성]-[상태]
  예) --color-accent-default, --color-accent-hover
- 폰트: Pretendard (fallback: Inter, sans-serif)

## 기능 요구사항

### Must Have
- 할 일 추가(입력창 Enter/버튼), 체크박스 완료 토글, 삭제 버튼, 더블클릭 시 인라인 수정 모드
- 필터/정렬: 전체·진행중·완료 탭, 카테고리별 다중 필터, 생성일순/마감일순 정렬
- 데이터 저장: 1차 브라우저 LocalStorage(새로고침 유지) → 추후 서버 DB 동기화 확장
- 통계: "전체 N개" / "완료율 N%"(소수점 올림), 카테고리 필터 적용 시 재계산, 0개일 때 "할 일을 추가해보세요" 노출
- 완료된 항목 일괄 삭제
- 접근성: 키보드만으로 조작, WCAG AA 명도 대비, 시맨틱 HTML + aria-label
- 성능/호환성: 초기 로딩 3초 이내, 100개 이상도 지연 없음, Chrome/Safari/Edge/Firefox 최신 2개 버전
- (Scope Out, 1차 제외): 팀 협업, 캘린더 연동, 알림 푸시

### 카테고리 4종 (⚠️ 문서 기준 4종 — 요청 형식의 "6종"과 다름, 문서 원문 그대로 기록)
- 💼 업무 — `#7A6A5E` (뮤트 브라운): 회사 업무, 회의, 보고서 관련
- 👤 개인 — `#6B7A5E` (뮤트 올리브그린): 병원, 약속, 취미 등
- 🤝 회의/미팅 — `#A87C5A` (뮤트 테라코타): 회의 준비/참석/후속 조치
- 📂 기타 — `#9C9184` (웜 그레이/타우프, 미선택 시 기본값)
- 태그 배경은 각 색상의 10~15% 투명도 + 진한 텍스트

### 데이터 구조 (⚠️ 문서에 명시적 스키마 없음 — 기능 설명 기반 추론)
```
Todo {
  id: string
  text: string
  categoryId: string      // Category.id 참조, 미선택 시 '기타'
  completed: boolean
  createdAt: string        // ISO 8601, 생성일순 정렬 기준
  dueDate?: string         // ISO 8601, 마감일순 정렬 기준 (선택)
  order: number            // 리스트 표시 순서
}

Category {
  id: string
  name: string             // 업무 | 개인 | 회의/미팅 | 기타
  color: string            // HEX
}
```

### 반응형 브레이크포인트
- Mobile (~767px): 전체 폭 100%, 좌우 padding 16px, 단일 컬럼, 입력 바 sticky, 터치 타겟 최소 44x44px
- Tablet (768~1023px): 컨테이너 최대 폭 640px, 중앙 정렬
- Desktop (1024px~): 컨테이너 최대 폭 720px, 중앙 정렬 카드형, Surface 배경 + radius 8px + 은은한 shadow

## 디자인 토큰 (노션 문서 기준)

### 색상
| 역할 | Hex | 비고 |
|---|---|---|
| Background | `#F7F3EC` | 전체 배경 |
| Surface | `#EDE6D8` | 카드/입력창 표면 |
| Border | `#DCD1BE` | 테두리 |
| Text Primary | `#311B14` | 타이틀/본문 |
| Text Secondary | `#7A6A5E` | 캡션/라벨 |
| Text Disabled | `#B8AC9E` | 완료 항목 |
| Primary (Action) | `#311B14` | 버튼/활성 탭/체크 완료 |
| Primary Hover | `#4A2E22` | 호버 시 |
| Primary 내부 텍스트 | `#EDE6D8` | 버튼 내부 글자 |
| Success | `#6B7A5E` | 완료율 게이지 |
| Danger | `#A8402E` | 삭제/경고 |

카테고리별 색상은 위 "카테고리 4종" 참조.

### 타이포그래피
| 요소 | Size | Weight | Line-height | Color |
|---|---|---|---|---|
| H1 (서비스 타이틀) | 24px | Bold(700) | 1.3 | `#311B14` |
| H2 (섹션 타이틀) | 18px | SemiBold(600) | - | `#311B14` |
| Body (할 일 텍스트/입력) | 16px | Regular(400) | 1.5 | `#311B14` |
| Caption (통계/필터/태그) | 13px | Medium(500) | - | `#7A6A5E` |
| 완료 항목 텍스트 | 16px + line-through | Regular(400) | 1.5 | `#B8AC9E` |

### 간격 토큰 (⚠️ 문서 명시 값은 4/8/16/24/32px 5단계 — space-1~8 이름은 추론)
- `--space-1`: 4px
- `--space-2`: 8px
- `--space-3`: 16px
- `--space-4`: 24px
- `--space-5`: 32px
- (문서에 6~8단계 세분화 값은 없음, 8px 그리드 기준 4/8/16/24/32px만 사용됨)

### 컴포넌트별 border-radius / shadow
| 컴포넌트 | radius | 기타 |
|---|---|---|
| 텍스트 인풋 / 카테고리 드롭다운 | 8px | border 1px `#DCD1BE`, 포커스 시 border `#311B14` + 옅은 shadow |
| 추가 버튼 | 8px | Dark Cocoa 배경, 호버 `#4A2E22` |
| Desktop 컨테이너(카드) | 8px | Surface 배경 + 은은한 shadow |
| 필터 탭 (Pill) | 18px | 높이 36px |
| 할 일 리스트 아이템 | - | 카드 분리형, border 1px `#DCD1BE`, 최소 높이 56px, 항목 간 8px 간격 |
| 체크박스 | - | 24x24px (문서에 radius 미기재) |

## 참조 파일 (이후 생성 예정)
- docs/design-tokens.md
- src/styles/tokens.css
