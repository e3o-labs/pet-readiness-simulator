export const READINESS_LEARNING_RUNTIME_STATUS = 'source_reviewed';
export const READINESS_LEARNING_RUNTIME_ENABLED = true;

export const READINESS_LEARNING_CARDS = [
  {
    "day": 1,
    "id": "learning-day-1-alone-time",
    "reviewStatus": "source_reviewed",
    "evidenceStatus": "source_verified",
    "title": "혼자 있는 시간도 준비가 필요해요",
    "summary": "내 외출 시간과 강아지가 편안하게 지내는 시간은 다를 수 있어요.",
    "why": "사람에게 익숙한 출근 시간이 강아지에게도 편안한 시간인 것은 아니에요. 혼자 지내는 연습은 강아지의 반응을 살피며 조금씩 진행해야 해요. 오래 집을 비워야 한다면 대신 돌봐줄 사람이나 돌봄 서비스를 함께 알아보세요.",
    "tryToday": "평일에 가장 오래 집을 비우는 시간과 그때 확인할 돌봄 대안 하나를 적어보세요.",
    "watchFor": [
      "외출 준비 때 과도하게 따라다님",
      "혼자 있을 때 지속적인 짖음·서성임",
      "돌아왔을 때 지나치게 진정하기 어려움"
    ],
    "boundary": "특정 반응만으로 분리 관련 문제를 진단하지 않습니다. 반복되거나 심한 불안이 보인다면 전문가와 상담할 수 있어요.",
    "contentVersion": 4,
    "missionId": "day-1-long-term-routine",
    "reflectionQuestion": "내가 없을 때 돌봄을 맡아줄 대안을 실제로 확인했나요?",
    "infographic": {
      "id": "LEARNING-INFOGRAPHIC-V3-DAY-1",
      "status": "illustration_context_checked",
      "panels": [
        {
          "title": "내 시간표 보기",
          "caption": "집이 비는 시간을 표시해요.",
          "scene": "timeline",
          "altText": "보호자가 식탁에서 시간표를 적고 강아지는 옆의 매트에서 쉰다."
        },
        {
          "title": "강아지 반응 보기",
          "caption": "혼자 있을 때의 모습을 살펴요.",
          "scene": "dog",
          "altText": "강아지가 현관문을 향해 서서 기다린다."
        },
        {
          "title": "돌봄 공백 메우기",
          "caption": "대신 돌봐줄 방법을 찾아요.",
          "scene": "people",
          "altText": "보호자가 방문한 돌봄 담당자를 맞이하고 강아지가 곁에 있다."
        }
      ],
      "altText": "보호자가 식탁에서 시간표를 적고 강아지는 옆의 매트에서 쉰다. 강아지가 현관문을 향해 서서 기다린다. 보호자가 방문한 돌봄 담당자를 맞이하고 강아지가 곁에 있다.",
      "contextNote": "문 앞에서 기다리는 모습만으로 불안 여부를 판단하지 않아요.",
      "layoutVersion": "stacked_mobile_v3"
    },
    "publicationStatus": "enabled",
    "sourceCheckedAt": "2026-10-21",
    "sources": [
      {"label": "RSPCA · 혼자 있는 시간 연습", "url": "https://www.rspca.org.uk/adviceandwelfare/pets/dogs/training/leftalone"},
      {
        "label": "RSPCA · 혼자 있을 때의 반응",
        "url": "https://www.rspca.org.uk/adviceandwelfare/pets/dogs/behaviour/separationrelatedbehaviour"
      }
    ]
  },
  {
    "day": 2,
    "id": "learning-day-2-food-cost",
    "reviewStatus": "source_reviewed",
    "evidenceStatus": "source_verified",
    "title": "먹는 것과 돌봄 비용을 함께 준비해요",
    "summary": "하루 먹는 것과 정기·예상 밖 지출을 함께 계획해요.",
    "why": "가족이 준 간식을 함께 기록하고 하루 먹는 것 안에서 생각해요. 간식이 식사를 대신하지 않도록 해요. 어떤 간식과 양이 맞는지는 강아지의 상태에 따라 달라요. 이 활동에서는 금액이나 급여량의 합격선을 정하지 않고, 식비와 예상 밖 지출을 나눠 적어봐요.",
    "tryToday": "예산을 정기 지출과 예상 밖 지출로 나누고 각각 한 가지 이상 적어보세요.",
    "watchFor": [
      "간식이 식사를 대신함",
      "가족마다 보상 기준이 다름",
      "예상 밖의 의료비 대안이 없음"
    ],
    "boundary": "평균 양육비나 간식 기준은 개인의 합격선이 아닙니다. 식사량·체중·질환 관리는 개별 상태에 맞는 수의학적 안내가 우선입니다.",
    "contentVersion": 4,
    "missionId": "day-2-cost-plan",
    "reflectionQuestion": "처음에는 떠올리지 못했던 비용이 있었나요?",
    "infographic": {
      "id": "LEARNING-INFOGRAPHIC-V3-DAY-2",
      "status": "illustration_context_checked",
      "panels": [
        {
          "title": "조금씩 모인 간식",
          "caption": "가족이 준 간식도 모두 더해져요.",
          "scene": "bowl",
          "altText": "가족 두 명이 같은 강아지 그릇에 간식을 더한다."
        },
        {
          "title": "하루 먹는 것 보기",
          "caption": "사료와 간식을 함께 계획해요.",
          "scene": "food",
          "altText": "사료 봉지와 사료 그릇, 간식 통을 함께 놓았다."
        },
        {
          "title": "비용 두 칸 나누기",
          "caption": "정기 지출과 비상 지출을 나눠요.",
          "scene": "budget",
          "altText": "보호자가 두 봉투를 보며 용품과 이동장 옆에서 지출을 생각한다."
        }
      ],
      "altText": "가족 두 명이 같은 강아지 그릇에 간식을 더한다. 사료 봉지와 사료 그릇, 간식 통을 함께 놓았다. 보호자가 두 봉투를 보며 용품과 이동장 옆에서 지출을 생각한다.",
      "contextNote": "그림 속 음식 양과 그릇 크기는 적정 급여량이나 비율을 뜻하지 않아요.",
      "layoutVersion": "stacked_mobile_v3"
    },
    "publicationStatus": "enabled",
    "sourceCheckedAt": "2026-10-21",
    "sources": [
      {
        "label": "WSAVA · 반려견 간식 안내",
        "url": "https://wsava.org/wp-content/uploads/2025/11/WSAVA_GuidetoTreats_Dogs_251107.pdf"
      }
    ]
  },
  {
    "day": 3,
    "id": "learning-day-3-walk-social",
    "reviewStatus": "source_reviewed",
    "evidenceStatus": "source_verified",
    "title": "산책에서 꼭 인사하지 않아도 괜찮아요",
    "summary": "가까이 만나기 전에 편안한 거리를 살펴요.",
    "why": "모든 강아지가 낯선 사람이나 다른 강아지와 가까이 인사하고 싶어 하지는 않아요. 몸을 피하거나 굳는 모습이 보이면 접근을 멈추고 여유를 주세요. 꼬리 하나만 보지 말고 몸 전체와 주변 상황을 함께 살펴요.",
    "tryToday": "산책 후보 길에서 좁은 통로와 잠시 피할 수 있는 넓은 공간을 하나씩 찾아보세요. 강아지 없이 걸어봐도 좋아요.",
    "watchFor": [
      "몸을 뒤로 빼거나 피함",
      "시선을 돌리거나 굳음",
      "상대에게 다가가고 싶지 않은데 리드줄로 끌려감"
    ],
    "boundary": "사회성은 모든 대상과 가까이 접촉하는 것과 같지 않습니다. 개체별 편안한 거리와 속도가 다를 수 있어요.",
    "contentVersion": 4,
    "missionId": "day-3-walk-routine",
    "reflectionQuestion": "인사를 강요하지 않고 지나갈 길이 있었나요?",
    "infographic": {
      "id": "LEARNING-INFOGRAPHIC-V3-DAY-3",
      "status": "illustration_context_checked",
      "panels": [
        {
          "title": "만나기 전에 멈추기",
          "caption": "바로 다가가지 않고 살펴요.",
          "scene": "distance",
          "altText": "보호자와 강아지가 다른 산책자와 떨어져 넓은 공원길을 걷는다."
        },
        {
          "title": "몸과 주변 살펴보기",
          "caption": "몸 전체와 주변 상황을 함께 봐요.",
          "scene": "dog",
          "altText": "다른 강아지 근처에서 강아지 몸이 비스듬히 돌아서 있으며 리드줄은 느슨하다."
        },
        {
          "title": "다른 길 선택하기",
          "caption": "넓게 돌아 지나가도 괜찮아요.",
          "scene": "route",
          "altText": "보호자와 강아지가 다른 산책자와 갈라지는 넓은 길을 선택한다."
        }
      ],
      "altText": "보호자와 강아지가 다른 산책자와 떨어져 넓은 공원길을 걷는다. 다른 강아지 근처에서 강아지 몸이 비스듬히 돌아서 있으며 리드줄은 느슨하다. 보호자와 강아지가 다른 산책자와 갈라지는 넓은 길을 선택한다.",
      "contextNote": "그림은 상황 예시예요. 한 장면이나 몸짓 하나로 감정을 단정하지 않아요.",
      "layoutVersion": "stacked_mobile_v3"
    },
    "publicationStatus": "enabled",
    "sourceCheckedAt": "2026-10-21",
    "sources": [
      {
        "label": "Dogs Trust · 몸짓과 주변 상황",
        "url": "https://www.dogstrust.org.uk/dog-advice/understanding-your-dog/body-language"
      }
    ]
  },
  {
    "day": 4,
    "id": "learning-day-4-touch-rest",
    "reviewStatus": "source_reviewed",
    "evidenceStatus": "source_verified",
    "title": "만지기 전에 반응부터 살펴요",
    "summary": "관리에 앞서 접촉에 익숙해지는 과정을 준비해요.",
    "why": "발 닦기나 빗질처럼 필요한 관리도 강아지에게는 낯설 수 있어요. 한 번에 끝내려고 붙잡기보다 짧은 단계로 나누고 반응을 살펴요. 몸을 피하거나 굳으면 잠시 멈추세요. 쉬거나 자는 동안에는 충분히 쉴 수 있도록 해주세요.",
    "tryToday": "발 닦기·빗질·양치 중 하나를 골라 필요한 도구와 먼저 알아볼 방법을 적어보세요. 실제 강아지를 붙잡고 연습할 필요는 없어요.",
    "watchFor": [
      "몸이 굳음",
      "고개나 몸을 피함",
      "입술 핥기·하품·거리 두기"
    ],
    "boundary": "한 가지 몸짓만으로 감정을 단정하지 않습니다. 여러 신호와 상황을 함께 관찰해요.",
    "contentVersion": 4,
    "missionId": "day-4-basic-care",
    "reflectionQuestion": "관리를 끝내는 것보다 강아지의 반응을 먼저 살필 수 있을까요?",
    "infographic": {
      "id": "LEARNING-INFOGRAPHIC-V3-DAY-4",
      "status": "illustration_context_checked",
      "panels": [
        {
          "title": "도구부터 알아보기",
          "caption": "억지로 가까이 대지 않아요.",
          "scene": "brush",
          "altText": "보호자가 앉아서 빗을 보여주고 강아지는 몸을 붙잡히지 않은 채 서 있다."
        },
        {
          "title": "작게 나눠보기",
          "caption": "짧게 접촉하며 반응을 살펴요.",
          "scene": "steps",
          "altText": "보호자가 강아지 옆면에 빗을 대고 반응을 살핀다."
        },
        {
          "title": "피하면 멈추기",
          "caption": "몸을 피하면 손을 거둬요.",
          "scene": "pause",
          "altText": "강아지가 침대로 이동하고 보호자는 빗을 거둬 무릎 쪽에 둔다."
        }
      ],
      "altText": "보호자가 앉아서 빗을 보여주고 강아지는 몸을 붙잡히지 않은 채 서 있다. 보호자가 강아지 옆면에 빗을 대고 반응을 살핀다. 강아지가 침대로 이동하고 보호자는 빗을 거둬 무릎 쪽에 둔다.",
      "contextNote": "그림은 관리 방법 전체를 설명하지 않아요. 피하거나 굳으면 접촉을 멈추세요.",
      "layoutVersion": "stacked_mobile_v3"
    },
    "publicationStatus": "enabled",
    "sourceCheckedAt": "2026-10-21",
    "sources": [
      {
        "label": "Dogs Trust · 접촉과 관리",
        "url": "https://www.dogstrust.org.uk/dog-advice/health-wellbeing/at-home/how-to-handle-your-dog"
      },
      {
        "label": "Dogs Trust · 몸짓과 주변 상황",
        "url": "https://www.dogstrust.org.uk/dog-advice/understanding-your-dog/body-language"
      }
    ]
  },
  {
    "day": 5,
    "id": "learning-day-5-consistency",
    "reviewStatus": "source_reviewed",
    "evidenceStatus": "source_verified",
    "title": "가족이 같은 신호를 쓰면 이해하기 쉬워요",
    "summary": "함께 정한 기준으로 강아지가 덜 헷갈리게 도와요.",
    "why": "같은 행동에 누군가는 간식을 주고 누군가는 꾸짖으면 강아지는 무엇을 해야 할지 이해하기 어려울 수 있어요. 원하는 행동을 정하고 같은 신호와 보상 방식을 사용해요. 식사와 산책의 담당자, 그 사람이 없을 때의 대안도 정해두세요.",
    "tryToday": "돌봄 항목 하나의 담당자·대체 담당·함께 쓸 기준을 적어보세요. 혼자 산다면 확인할 돌봄 서비스를 적어도 좋아요.",
    "watchFor": [
      "같은 행동에 사람마다 다른 반응",
      "담당자가 없어 돌봄이 빠짐",
      "신호어가 자주 바뀜"
    ],
    "boundary": "일관성은 강압적인 통제를 뜻하지 않습니다. 예측 가능한 환경과 이해하기 쉬운 신호를 만드는 것이 목적이에요.",
    "contentVersion": 4,
    "missionId": "day-5-role-plan",
    "reflectionQuestion": "아직 아무도 맡지 않은 돌봄이 있었나요?",
    "infographic": {
      "id": "LEARNING-INFOGRAPHIC-V3-DAY-5",
      "status": "illustration_context_checked",
      "panels": [
        {
          "title": "가족 생각 나누기",
          "caption": "서로 기대하는 돌봄을 이야기해요.",
          "scene": "signals",
          "altText": "가족 두 명이 강아지 옆에서 서로 바라보며 이야기한다."
        },
        {
          "title": "한 가지 기준 맞추기",
          "caption": "원하는 행동과 방법을 정해요.",
          "scene": "people",
          "altText": "가족이 함께 계획표를 확인하고 강아지는 뒤의 매트에서 쉰다."
        },
        {
          "title": "담당과 대안 정하기",
          "caption": "담당자가 없는 날까지 계획해요.",
          "scene": "roles",
          "altText": "가족이 현관에서 산책줄을 인계하고 강아지가 옆에서 기다린다."
        }
      ],
      "altText": "가족 두 명이 강아지 옆에서 서로 바라보며 이야기한다. 가족이 함께 계획표를 확인하고 강아지는 뒤의 매트에서 쉰다. 가족이 현관에서 산책줄을 인계하고 강아지가 옆에서 기다린다.",
      "contextNote": "함께 쓸 신호와 돌봄 기준은 가족끼리 미리 정해요.",
      "layoutVersion": "stacked_mobile_v3"
    },
    "publicationStatus": "enabled",
    "sourceCheckedAt": "2026-10-21",
    "sources": [
      {
        "label": "VCA · 예측 가능한 일상과 보상",
        "url": "https://vcahospitals.com/know-your-pet/using-enrichment-predictability-and-scheduling-to-train-your-dog"
      }
    ]
  },
  {
    "day": 6,
    "id": "learning-day-6-humane-response",
    "reviewStatus": "source_reviewed",
    "evidenceStatus": "source_verified",
    "title": "짖을 때는 먼저 상황을 살펴요",
    "summary": "짖기 직전의 상황과 도와줄 방법을 찾아요.",
    "why": "강아지가 짖었다면 직전에 무슨 일이 있었는지 먼저 살펴보세요. 낯선 소리가 났는지, 누군가 가까이 왔는지, 필요한 돌봄이 있었는지 돌아봐요. 큰 소리나 위협 대신 자극과 거리를 조절하고 원하는 행동을 배울 수 있도록 도와주세요.",
    "tryToday": "초인종이 울려 짖는 가상 상황에서 지금 바꿀 환경과 나중에 연습할 행동을 하나씩 적어보세요.",
    "watchFor": [
      "공포를 유발하는 위협 사용",
      "행동이 끝난 뒤 뒤늦게 혼냄",
      "원하는 행동은 알려주지 않고 금지만 반복함"
    ],
    "boundary": "공격성, 심한 공포, 반복적인 이상 행동이나 갑작스러운 행동 변화는 전문가 평가가 필요한 경우가 있습니다.",
    "contentVersion": 4,
    "missionId": "day-6-situation-event",
    "reflectionQuestion": "짖음을 멈추라는 말 외에 어떤 대안을 준비했나요?",
    "infographic": {
      "id": "LEARNING-INFOGRAPHIC-V3-DAY-6",
      "status": "illustration_context_checked",
      "panels": [
        {
          "title": "직전 상황 찾기",
          "caption": "무슨 일이 먼저 있었나요?",
          "scene": "bell",
          "altText": "현관 밖 방문객이 초인종을 누르고 안의 강아지가 문 쪽을 향해 짖는다."
        },
        {
          "title": "자극과 거리 두기",
          "caption": "접근을 줄이는 환경의 예시예요.",
          "scene": "distance",
          "altText": "방문객과 강아지 사이에 안전문을 두고 보호자가 공간을 나눈다."
        },
        {
          "title": "배울 대안 살펴보기",
          "caption": "차분한 상황에서 보상으로 연습해요.",
          "scene": "mat",
          "altText": "강아지가 문에서 떨어진 매트에 누워 있고 보호자가 보상을 놓는다."
        }
      ],
      "altText": "현관 밖 방문객이 초인종을 누르고 안의 강아지가 문 쪽을 향해 짖는다. 방문객과 강아지 사이에 안전문을 두고 보호자가 공간을 나눈다. 강아지가 문에서 떨어진 매트에 누워 있고 보호자가 보상을 놓는다.",
      "contextNote": "세 장면은 상황 예시이며 즉시 짖음을 해결하는 순서나 차단 장치 설치 방법을 뜻하지 않아요.",
      "layoutVersion": "stacked_mobile_v3"
    },
    "publicationStatus": "enabled",
    "sourceCheckedAt": "2026-10-21",
    "sources": [
      {
        "label": "AVSAB · 보상 기반 교육",
        "url": "https://avsab.org/resources/position-statements/"
      },
      {
        "label": "VCA · 예측 가능한 일상과 보상",
        "url": "https://vcahospitals.com/know-your-pet/using-enrichment-predictability-and-scheduling-to-train-your-dog"
      },
      {
        "label": "Dogs Trust · 몸짓과 주변 상황",
        "url": "https://www.dogstrust.org.uk/dog-advice/understanding-your-dog/body-language"
      }
    ]
  },
  {
    "day": 7,
    "id": "learning-day-7-reflection",
    "reviewStatus": "editorial_reviewed",
    "evidenceStatus": "product_reflection",
    "title": "입양 전에 바꿀 한 가지를 정해요",
    "summary": "배운 내용을 내 생활의 다음 행동으로 옮겨요.",
    "why": "7일 동안 새로 알게 된 점과 예상보다 어려웠던 일을 돌아보세요. 외출 시간, 비용, 산책, 관리, 돌봄 역할 중 더 확인할 항목이 있을 거예요. 가장 먼저 바꿀 한 가지와 확인할 날짜를 정해보세요. 준비를 더 한 뒤 결정해도 괜찮아요.",
    "tryToday": "“입양 전에 ___을 더 확인하겠습니다. ___까지 ___을 해보겠습니다.”를 완성해보세요.",
    "watchFor": [
      "점수만 보고 결론 내리려 함",
      "보완 가능한 조건을 실패로 해석함",
      "가족·시간·비용 대안을 확인하지 않고 결정함"
    ],
    "boundary": "이 앱은 입양 적합성 판정이나 행동·의료 진단을 제공하지 않습니다. 기록은 다음 결정을 위한 참고 자료예요.",
    "contentVersion": 4,
    "missionId": "day-7-reflection",
    "reflectionQuestion": "다음 결정을 위해 지금 가장 필요한 정보는 무엇인가요?",
    "infographic": {
      "id": "LEARNING-INFOGRAPHIC-V3-DAY-7",
      "status": "illustration_context_checked",
      "panels": [
        {
          "title": "처음 생각 꺼내기",
          "caption": "처음에는 어떻게 생각했나요?",
          "scene": "note",
          "altText": "보호자가 노트를 앞에 두고 생각하며 강아지가 곁에서 쉰다."
        },
        {
          "title": "새로 발견한 조건",
          "caption": "7일 동안 무엇을 발견했나요?",
          "scene": "note",
          "altText": "시계와 지갑, 산책줄이 그려진 세 장의 카드를 정리한다."
        },
        {
          "title": "다음 행동 정하기",
          "caption": "언제 무엇을 확인할지 정해요.",
          "scene": "calendar",
          "altText": "보호자가 계획을 적고 강아지는 옆의 침대에서 쉰다."
        }
      ],
      "altText": "보호자가 노트를 앞에 두고 생각하며 강아지가 곁에서 쉰다. 시계와 지갑, 산책줄이 그려진 세 장의 카드를 정리한다. 보호자가 계획을 적고 강아지는 옆의 침대에서 쉰다.",
      "contextNote": "가상 체험 기록은 실제 돌봄 능력이나 입양 자격을 판정하지 않아요.",
      "layoutVersion": "stacked_mobile_v3"
    },
    "publicationStatus": "enabled",
    "sourceCheckedAt": "2026-10-21",
    "sources": []
  }
];

export function isPublishedLearningCard(card) {
  return READINESS_LEARNING_RUNTIME_ENABLED && card?.publicationStatus === 'enabled' && ((card.day === 7 && card.reviewStatus === 'editorial_reviewed' && card.evidenceStatus === 'product_reflection') || (card.reviewStatus === 'source_reviewed' && Array.isArray(card.sources) && card.sources.length > 0));
}
export function learningCardForDay(day) {
  return READINESS_LEARNING_CARDS.find(card => card.day === day && isPublishedLearningCard(card)) || null;
}
