import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BtnComp from '../../../components/BtnComp';
import { getExercises } from '../../../api/Exercise';
import {
  calculateWorkout,
  createWorkout,
  deleteWorkout,
  getWorkoutByDate,
} from '../../../api/Workout';

function InputRow({ label, exerciseId, value, onChange }) {
  return (
    <div className="flex flex-col sm:grid sm:grid-cols-[90px_1fr] items-start sm:items-center gap-2 sm:gap-x-4 min-w-0">
      <span className="!text-sm text-gray-700 whitespace-nowrap">{label}</span>
      <input
        type="number"
        min="0"
        value={value}
        onChange={(e) => onChange(exerciseId, e.target.value)}
        placeholder="분 단위로 입력해주세요"
        className="w-full min-w-0 h-9 rounded-md border border-deep bg-white px-3 text-sm"
      />
    </div>
  );
}

function CategoryBlock({ title, list, exerciseInputs, handleChange }) {
  if (!list || list.length === 0) return null;

  console.log(' CategoryBlock exerciseInputs:', exerciseInputs);

  return (
    <div className="mb-8">
      <div className="flex items-start gap-6">
        <h3 className="text-green-800 font-bold !text-2xl leading-10 min-w-[150px]">
          {title}
        </h3>
        <div className="flex flex-col gap-3 flex-1">
          {list.map((exercise) => (
            <InputRow
              key={exercise.id}
              label={exercise.name}
              exerciseId={exercise.id}
              value={exerciseInputs[String(exercise.id)] ?? ''}
              onChange={handleChange}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function HealthHistoryWrite() {
  const navigate = useNavigate();
  const location = useLocation();
  const record = location.state?.record;

  const [exercises, setExercises] = useState([]);
  const [exerciseInputs, setExerciseInputs] = useState({});
  const [totalCalories, setTotalCalories] = useState(0);
  const [selectedDate, setSelectedDate] = useState('');

  const today = new Date();
  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
    today.getDate(),
  ).padStart(2, '0')}`;

  useEffect(() => {
    if (!selectedDate) return;

    const fetchByDate = async () => {
      try {
        const data = await getWorkoutByDate(selectedDate);

        if (!data || data.length === 0) {
          // 해당 날짜 기록 없으면 초기화
          setExerciseInputs({});
          setTotalCalories(0);
          return;
        }

        const inputObj = {};
        let total = 0;

        data.forEach((item) => {
          inputObj[String(item.exerciseId)] = item.durationMin;
          total += item.burntCalories;
        });

        setExerciseInputs(inputObj);
        setTotalCalories(total);
      } catch (error) {
        console.error('날짜별 조회 실패', error);
      }
    };
    fetchByDate();
  }, [selectedDate]);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const data = await getExercises();
        console.log(' 운동목록:', data);
        setExercises(data);
      } catch (error) {
        console.error('운동 목록 불러오기 실패', error);
      }
    };
    fetchExercises();
  }, []);

  // 수정 모드 세팅
  useEffect(() => {
    if (record && exercises.length > 0) {
      console.log(' record 전체', record);

      setSelectedDate(record.date || record.dateAt);

      const inputObj = {};
      record.exercises.forEach((ex) => {
        console.log(' record ex:', ex);
        inputObj[String(ex.exerciseId)] = Number(ex.durationMin);
      });

      setExerciseInputs(inputObj);
      setTotalCalories(record.totalCalories || 0);

      console.log(' 초기 세팅 exerciseInputs:', inputObj);
    } else if (!record) {
      setSelectedDate(todayString);
    }
  }, [record, exercises]);

  const handleChange = (exerciseId, value) => {
    console.log(' 입력 변경:', exerciseId, value);
    setExerciseInputs((prev) => ({
      ...prev,
      [String(exerciseId)]: value,
    }));

    setTotalCalories(0);
  };

  //  계산
  const handleCalculate = async () => {
    console.log(' 계산 시작');
    console.log('현재 날짜:', selectedDate);
    console.log('현재 입력값:', exerciseInputs);

    if (!selectedDate) {
      alert('날짜가 없습니다.');
      return;
    }

    const payload = {
      dateAt: selectedDate,
      exercises: Object.entries(exerciseInputs)
        .filter(([_, duration]) => Number(duration) > 0)
        .map(([exerciseId, durationMin]) => ({
          exerciseId: Number(exerciseId),
          durationMin: Number(durationMin),
        })),
    };

    console.log('calculate payload:', payload);

    if (payload.exercises.length === 0) {
      alert('운동 시간을 입력해주세요!');
      return;
    }

    try {
      const data = await calculateWorkout(payload);
      console.log(' calculate 응답:', data);
      setTotalCalories(data.totalCalories);
    } catch (error) {
      console.error(' 계산 실패', error);
      alert('칼로리 계산 중 오류가 발생했습니다.');
    }
  };

  // 저장
  const handleSave = async () => {
    console.log('저장 시작');
    console.log('현재 입력값:', exerciseInputs);
    console.log('현재 totalCalories:', totalCalories);

    if (totalCalories <= 0) {
      alert('운동 시간을 입력하고 계산 후 저장해주세요!');
      return;
    }

    try {
      //  1. 기존 날짜 기록 조회
      const existingData = await getWorkoutByDate(selectedDate);

      //  2. 기존 기록 삭제
      if (existingData && existingData.length > 0) {
        await Promise.all(
          existingData.map((item) => {
            console.log('🗑 삭제 요청:', item.id);
            return deleteWorkout(item.id);
          }),
        );
      }

      //  3. 새로 입력된 값으로 생성
      for (const [exerciseId, duration] of Object.entries(exerciseInputs)) {
        const durationNum = Number(duration);

        if (durationNum > 0) {
          console.log('create 요청:', exerciseId, durationNum);

          const res = await createWorkout({
            exerciseId: Number(exerciseId),
            durationMin: durationNum,
            dateAt: selectedDate,
          });

          console.log('create 응답:', res);
        }
      }

      alert(`총 ${totalCalories} Kcal 운동 기록이 저장되었습니다!`);

      navigate('/mypage/healthhistory', {
        state: { refresh: true },
      });
    } catch (error) {
      console.error('저장 실패 상세:', error);
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  const handleCancel = () => {
    navigate('/mypage/healthhistory');
  };

  const core = exercises.filter((e) => e.name.includes('플랭크'));
  const cardio = exercises.filter((e) =>
    ['걷기', '달리기', '자전거', '줄넘기'].some((k) => e.name.includes(k)),
  );
  const strength = exercises.filter((e) =>
    ['푸시업', '런지', '웨이트'].some((k) => e.name.includes(k)),
  );
  const flexibility = exercises.filter(
    (e) => e.name.includes('요가') || e.name.includes('스트레칭'),
  );
  const hiit = exercises.filter((e) =>
    ['버피', '계단'].some((k) => e.name.includes(k)),
  );

  return (
    <div className="wrap !mt-0 !bg-light-02">
      <div className="containers">
        <section className="sect_tit flex items-center justify-center mx-0 mt-[50px] border-b-[5px] border-main-02">
          <h3 className="!text-main-02 mb-[20px] flex items-center gap-2">
            <span className="material-icons">directions_run</span>
            나의 운동 기록 하기
          </h3>
        </section>

        <div className="flex justify-center mt-[3%]">
          <div className="relative w-[200px]">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full border border-main-02 rounded-[5px] px-4 py-2 text-center bg-white text-deep focus:ring-2 focus:ring-main-02 accent-deep"
            />
          </div>
        </div>

        <section className="sect1 w-full md:w-[90%] lg:w-[70%] xl:w-[45%] bg-white rounded-[20px] border border-green-800 shadow-[0_4px_4px_rgba(0,0,0,0.15)] mx-auto my-[3%] mb-[5%]">
          <div className="max-w-[920px] mx-auto px-4 sm:px-6 py-6 sm:py-10">
            <CategoryBlock
              title="코어"
              list={core}
              exerciseInputs={exerciseInputs}
              handleChange={handleChange}
            />
            <CategoryBlock
              title="유산소"
              list={cardio}
              exerciseInputs={exerciseInputs}
              handleChange={handleChange}
            />
            <CategoryBlock
              title="근력"
              list={strength}
              exerciseInputs={exerciseInputs}
              handleChange={handleChange}
            />
            <CategoryBlock
              title="유연성"
              list={flexibility}
              exerciseInputs={exerciseInputs}
              handleChange={handleChange}
            />
            <CategoryBlock
              title="종합/HIIT"
              list={hiit}
              exerciseInputs={exerciseInputs}
              handleChange={handleChange}
            />

            <div className="flex justify-center w-[50%] mx-auto mt-4">
              <BtnComp
                variant="primary"
                size="short"
                onClick={handleCalculate}
                className="!w-[48%] !mt-0 !h-[35px] !text-xs md:!text-sm"
              >
                계산
              </BtnComp>
            </div>

            <p className="text-center mt-6 md:mt-8 text-sm sm:text-base px-6">
              오늘 하신 운동의 칼로리 소모량은
              <span className="text-red-500 font-bold">
                {' '}
                {totalCalories} Kcal
              </span>
              입니다.
            </p>

            <div className="flex gap-2 mt-2 w-[50%] mx-auto py-[5%]">
              <BtnComp
                variant="primary"
                size="short"
                onClick={handleSave}
                className="!w-[48%] !mt-0 !h-[35px] !text-xs md:!text-sm"
              >
                저장
              </BtnComp>

              <BtnComp
                variant="point"
                size="short"
                onClick={handleCancel}
                className="!w-[48%] !mt-0 !h-[35px] !text-xs md:!text-sm"
              >
                취소
              </BtnComp>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default HealthHistoryWrite;
