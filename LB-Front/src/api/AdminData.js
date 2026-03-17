import apiClient, { BASE_URL } from "./config";

// 전체 멤버 목록 조회
export const fetchAllMembers = async (params = {}) => {
  try {
    const response = await apiClient.get("/members", { params });
    console.log("fetchAllMembers API 응답:", response.data);
    const rawData = Array.isArray(response.data)
      ? response.data
      : response.data?.data || response.data?.content || [];
    
    // API 응답을 컴포넌트에서 사용할 수 있는 형태로 변환
    // member_id -> id로 매핑
    const membersData = rawData.map((member) => ({
      id: member.member_id || member.id,
      member_id: member.member_id,
      name: member.name || "",
      phone: member.phone || "",
      gender: member.gender || "",
      birthday: member.birthday || "",
      height: member.height || 0,
      weight: member.weight || 0,
      target_date: member.target_date || 0,
      goal: member.goal || "",
      goal_weight: member.goal_weight || 0,
      allergies: member.allergies || "",
      special_notes: member.special_notes || "",
      notificationCount: member.notificationCount || 0,
      daily_calories: member.daily_calories || 0,
      point: member.point || 0,
      email: member.email || "", // API 응답에 없을 수 있음
      role: member.role || member.roles || "", // API 응답에 없을 수 있음
      createdAt: member.createdAt || "",
      updatedAt: member.updatedAt || "",
    }));
    
    console.log("멤버 데이터:", membersData);
    return membersData;
  } catch (error) {
    console.error("전체 멤버 목록 조회 중 오류 발생:", error);
    throw error;
  }
};

// 멤버 삭제
export const deleteMember = async (memberId) => {
  try {
    const response = await apiClient.delete(`/members/${memberId}`);
    return response.data;
  } catch (error) {
    console.error("멤버 삭제 중 오류 발생:", error);
    throw error;
  }
};

// 멤버 정지 (role을 SUSPENDED로 변경)
export const suspendMember = async (memberId) => {
  try {
    const response = await apiClient.put(`/members/${memberId}/suspend`, {
      role: "SUSPENDED",
    });
    return response.data;
  } catch (error) {
    console.error("멤버 정지 중 오류 발생:", error);
    throw error;
  }
};

// 전체 클럽 멤버 목록 조회
export const fetchAllClubMembers = async () => {
  try {
    const response = await apiClient.get("/myclubs/all");
    console.log("fetchAllClubMembers API 응답:", response.data);
    const rawData = Array.isArray(response.data)
      ? response.data
      : response.data?.data || response.data?.content || [];
    return rawData;
  } catch (error) {
    console.error("전체 클럽 멤버 목록 조회 중 오류 발생:", error);
    throw error;
  }
};

// 클럽별 멤버 목록 조회 (member_id와 club_id 매칭)
export const fetchClubMembers = async (clubId) => {
  try {
    // 전체 클럽 멤버와 전체 멤버 정보를 동시에 가져오기
    const [allClubMembers, allMembers] = await Promise.all([
      fetchAllClubMembers(),
      fetchAllMembers()
    ]);
    
    console.log("fetchClubMembers - 전체 클럽 멤버:", allClubMembers);
    console.log("fetchClubMembers - 전체 멤버 정보:", allMembers);
    
    // club_id로 필터링 (clubId는 문자열일 수 있으므로 숫자로 변환하여 비교)
    const clubIdNum = Number(clubId);
    const clubMembers = allClubMembers.filter(
      (clubMember) => {
        const clubMemberClubId = clubMember.club_id || clubMember.clubId;
        return (
          clubMemberClubId === clubIdNum || 
          clubMemberClubId === clubId ||
          String(clubMemberClubId) === String(clubId)
        );
      }
    );
    
    console.log(`fetchClubMembers - 클럽 ${clubId}의 멤버 관계:`, clubMembers);
    
    // member_id로 전체 멤버 정보와 조인
    const membersData = clubMembers.map((clubMember) => {
      const memberId = clubMember.member_id || clubMember.memberId;
      
      // 전체 멤버 목록에서 해당 member_id와 일치하는 멤버 찾기
      const memberInfo = allMembers.find(
        (member) => 
          (member.member_id || member.id) === memberId ||
          String(member.member_id || member.id) === String(memberId)
      );
      
      // 멤버 정보가 있으면 상세 정보 반환, 없으면 기본 정보만 반환
      if (memberInfo) {
        return {
          id: memberInfo.id || memberInfo.member_id || memberId,
          member_id: memberInfo.member_id || memberInfo.id || memberId,
          club_id: clubMember.club_id || clubMember.clubId,
          name: memberInfo.name || "",
          memberName: memberInfo.name || "",
          email: memberInfo.email || "",
          goal: memberInfo.goal || "",
          gender: memberInfo.gender || "",
          birthday: memberInfo.birthday || "",
          special_notes: memberInfo.special_notes || "",
        };
      } else {
        // 멤버 정보를 찾지 못한 경우 기본 정보만 반환
        return {
          id: memberId,
          member_id: memberId,
          club_id: clubMember.club_id || clubMember.clubId,
          name: clubMember.member_name || clubMember.name || "",
          memberName: clubMember.member_name || clubMember.name || "",
          email: clubMember.email || "",
          goal: "",
          gender: "",
          birthday: "",
          special_notes: "",
        };
      }
    });
    
    console.log(`fetchClubMembers - 최종 멤버 데이터:`, membersData);
    return membersData;
  } catch (error) {
    console.error("클럽별 멤버 목록 조회 중 오류 발생:", error);
    throw error;
  }
};

// 클럽에서 멤버 제거
export const removeMemberFromClub = async (clubId, memberId) => {
  try {
    const response = await apiClient.delete(
      `/admin/clubs/${clubId}/members/${memberId}`
    );
    return response.data;
  } catch (error) {
    console.error("클럽에서 멤버 제거 중 오류 발생:", error);
    throw error;
  }
};

// 전체 클럽 목록 조회 (ClubData.js의 fetchClubs 패턴 사용)
export const fetchAllClubs = async (params = {}) => {
  try {
    const response = await apiClient.get("/clubs", { params });
    console.log("fetchAllClubs API 응답:", response.data);
    const rawData = Array.isArray(response.data)
      ? response.data
      : response.data?.data || response.data?.content || [];
    
    // 클럽 데이터 변환 (ClubData.js와 동일한 패턴)
    const clubsData = rawData.map((club) => ({
      id: club.id,
      name: club.name,
      title: club.description ? club.description.split(".")[0] : "클럽",
      desc: club.description || "",
      image: club.filename
        ? `${BASE_URL}/file/${club.filename}`
        : "https://yjpmigedokqexuclsapm.supabase.co/storage/v1/object/public/images/Image2.png",
      tags: club.keywords
        ? club.keywords.split(",").map((k) => k.trim())
        : [],
      memberCount: club.memberCount || 0,
      postCount: club.postCount || 0,
      managerId: club.managerId,
      managerName: club.managerName || null,
      createdAt: club.createdAt,
    }));
    
    console.log("클럽 데이터:", clubsData);
    return clubsData;
  } catch (error) {
    console.error("전체 클럽 목록 조회 중 오류 발생:", error);
    throw error;
  }
};

// 클럽 상세 정보 조회 (ClubDetailData.js의 패턴 사용)
export const fetchClubDetail = async (clubId) => {
  try {
    const response = await apiClient.get(`/clubsummaries/${clubId}`);
    console.log("fetchClubDetail API 응답:", response.data);
    const club = response.data;
    
    return {
      id: club.id,
      name: club.name,
      description: club.description || "",
      image: club.filename
        ? `${BASE_URL}/file/${club.filename}`
        : "https://yjpmigedokqexuclsapm.supabase.co/storage/v1/object/public/images/Image2.png",
      tags: club.keywords
        ? club.keywords.split(",").map((k) => k.trim())
        : [],
      managerId: club.managerId,
      managerName: club.managerName || null,
      createdAt: club.createdAt,
    };
  } catch (error) {
    console.error("클럽 상세 정보 조회 중 오류 발생:", error);
    throw error;
  }
};

// 클럽 삭제
export const deleteClub = async (clubId) => {
  try {
    const response = await apiClient.delete(`/admin/clubs/${clubId}`);
    return response.data;
  } catch (error) {
    console.error("클럽 삭제 중 오류 발생:", error);
    throw error;
  }
};

// 클럽 정지
export const suspendClub = async (clubId) => {
  try {
    const response = await apiClient.put(`/admin/clubs/${clubId}/suspend`, {
      status: "SUSPENDED",
    });
    return response.data;
  } catch (error) {
    console.error("클럽 정지 중 오류 발생:", error);
    throw error;
  }
};

// 클럽 통계 조회
export const getClubStats = async (clubId) => {
  try {
    const response = await apiClient.get(`/admin/clubs/${clubId}/stats`);
    return response.data;
  } catch (error) {
    console.error("클럽 통계 조회 중 오류 발생:", error);
    throw error;
  }
};

// ==================== 대시보드 통계 함수 ====================

// 금주의 신설 클럽 (최근 7일)
export const getWeeklyNewClubs = async () => {
  try {
    const clubs = await fetchAllClubs();
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const weeklyClubs = clubs.filter((club) => {
      if (!club.createdAt) return false;
      const createdDate = new Date(club.createdAt);
      return createdDate >= sevenDaysAgo;
    });
    
    // 날짜별로 그룹화
    const dateGroups = {};
    weeklyClubs.forEach((club) => {
      if (club.createdAt) {
        const date = new Date(club.createdAt).toLocaleDateString("ko-KR", {
          month: "short",
          day: "numeric",
        });
        dateGroups[date] = (dateGroups[date] || 0) + 1;
      }
    });
    
    return dateGroups;
  } catch (error) {
    console.error("금주의 신설 클럽 조회 중 오류 발생:", error);
    throw error;
  }
};

// 여성이 많은 클럽 TOP 5
export const getFemaleDominantClubs = async () => {
  try {
    const [allClubMembers, allMembers, allClubs] = await Promise.all([
      fetchAllClubMembers(),
      fetchAllMembers(),
      fetchAllClubs(),
    ]);
    
    // 클럽별 여성 멤버 수 집계
    const clubFemaleCount = {};
    
    allClubMembers.forEach((clubMember) => {
      const memberId = clubMember.member_id || clubMember.memberId;
      const clubId = clubMember.club_id || clubMember.clubId;
      
      const member = allMembers.find(
        (m) => (m.member_id || m.id) === memberId
      );
      
      if (member && member.gender === "F") {
        clubFemaleCount[clubId] = (clubFemaleCount[clubId] || 0) + 1;
      }
    });
    
    // 클럽 정보와 함께 정렬
    const result = Object.entries(clubFemaleCount)
      .map(([clubId, count]) => {
        const club = allClubs.find((c) => c.id.toString() === clubId.toString());
        return {
          clubId: Number(clubId),
          clubName: club?.name || `클럽 ${clubId}`,
          femaleCount: count,
        };
      })
      .sort((a, b) => b.femaleCount - a.femaleCount)
      .slice(0, 5);
    
    return result;
  } catch (error) {
    console.error("여성이 많은 클럽 조회 중 오류 발생:", error);
    throw error;
  }
};

// 남성이 많은 클럽 TOP 5
export const getMaleDominantClubs = async () => {
  try {
    const [allClubMembers, allMembers, allClubs] = await Promise.all([
      fetchAllClubMembers(),
      fetchAllMembers(),
      fetchAllClubs(),
    ]);
    
    // 클럽별 남성 멤버 수 집계
    const clubMaleCount = {};
    
    allClubMembers.forEach((clubMember) => {
      const memberId = clubMember.member_id || clubMember.memberId;
      const clubId = clubMember.club_id || clubMember.clubId;
      
      const member = allMembers.find(
        (m) => (m.member_id || m.id) === memberId
      );
      
      if (member && member.gender === "M") {
        clubMaleCount[clubId] = (clubMaleCount[clubId] || 0) + 1;
      }
    });
    
    // 클럽 정보와 함께 정렬
    const result = Object.entries(clubMaleCount)
      .map(([clubId, count]) => {
        const club = allClubs.find((c) => c.id.toString() === clubId.toString());
        return {
          clubId: Number(clubId),
          clubName: club?.name || `클럽 ${clubId}`,
          maleCount: count,
        };
      })
      .sort((a, b) => b.maleCount - a.maleCount)
      .slice(0, 5);
    
    return result;
  } catch (error) {
    console.error("남성이 많은 클럽 조회 중 오류 발생:", error);
    throw error;
  }
};

// 연령대별 인기 클럽
export const getAgePopularClubs = async () => {
  try {
    const [allClubMembers, allMembers, allClubs] = await Promise.all([
      fetchAllClubMembers(),
      fetchAllMembers(),
      fetchAllClubs(),
    ]);
    
    // 연령대 계산 함수
    const getAgeGroup = (birthday) => {
      if (!birthday) return null;
      const birthYear = new Date(birthday).getFullYear();
      const currentYear = new Date().getFullYear();
      const age = currentYear - birthYear;
      
      if (age < 20) return "10대";
      if (age < 30) return "20대";
      if (age < 40) return "30대";
      if (age < 50) return "40대";
      if (age < 60) return "50대";
      return "60대 이상";
    };
    
    // 연령대별 클럽별 멤버 수 집계
    const ageClubCount = {};
    
    allClubMembers.forEach((clubMember) => {
      const memberId = clubMember.member_id || clubMember.memberId;
      const clubId = clubMember.club_id || clubMember.clubId;
      
      const member = allMembers.find(
        (m) => (m.member_id || m.id) === memberId
      );
      
      if (member && member.birthday) {
        const ageGroup = getAgeGroup(member.birthday);
        if (ageGroup) {
          if (!ageClubCount[ageGroup]) {
            ageClubCount[ageGroup] = {};
          }
          ageClubCount[ageGroup][clubId] =
            (ageClubCount[ageGroup][clubId] || 0) + 1;
        }
      }
    });
    
    // 각 연령대별 인기 클럽 TOP 3 추출
    const result = {};
    Object.keys(ageClubCount).forEach((ageGroup) => {
      const clubCounts = Object.entries(ageClubCount[ageGroup])
        .map(([clubId, count]) => {
          const club = allClubs.find((c) => c.id.toString() === clubId.toString());
          return {
            clubId: Number(clubId),
            clubName: club?.name || `클럽 ${clubId}`,
            count: count,
          };
        })
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);
      
      result[ageGroup] = clubCounts;
    });
    
    return result;
  } catch (error) {
    console.error("연령대별 인기 클럽 조회 중 오류 발생:", error);
    throw error;
  }
};

// 전체 통계
export const getTotalStats = async () => {
  try {
    const [allMembers, allClubs] = await Promise.all([
      fetchAllMembers(),
      fetchAllClubs(),
    ]);
    
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const recentMembers = allMembers.filter((member) => {
      if (!member.createdAt) return false;
      const createdDate = new Date(member.createdAt);
      return createdDate >= sevenDaysAgo;
    });
    
    return {
      totalMembers: allMembers.length,
      totalClubs: allClubs.length,
      recentMembers: recentMembers.length,
    };
  } catch (error) {
    console.error("전체 통계 조회 중 오류 발생:", error);
    throw error;
  }
};

// 멤버가 많은 클럽 TOP 5
export const getTopMemberClubs = async () => {
  try {
    const [allClubMembers, allClubs] = await Promise.all([
      fetchAllClubMembers(),
      fetchAllClubs(),
    ]);
    
    // 클럽별 멤버 수 집계
    const clubMemberCount = {};
    
    allClubMembers.forEach((clubMember) => {
      const clubId = clubMember.club_id || clubMember.clubId;
      clubMemberCount[clubId] = (clubMemberCount[clubId] || 0) + 1;
    });
    
    // 클럽 정보와 함께 정렬
    const result = Object.entries(clubMemberCount)
      .map(([clubId, count]) => {
        const club = allClubs.find((c) => c.id.toString() === clubId.toString());
        return {
          id: Number(clubId),
          name: club?.name || `클럽 ${clubId}`,
          memberCount: count,
        };
      })
      .sort((a, b) => b.memberCount - a.memberCount)
      .slice(0, 5);
    
    return result;
  } catch (error) {
    console.error("멤버가 많은 클럽 조회 중 오류 발생:", error);
    throw error;
  }
};

// 이번 주에 게시글이 많이 올라온 클럽 TOP 5
export const getWeeklyTopPostClubs = async () => {
  try {
    const clubs = await fetchAllClubs();
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // 클럽별 이번 주 게시글 수 집계
    const clubPostCount = {};
    
    // 모든 클럽의 일반 게시글을 가져오기
    const boardPromises = clubs.map(async (club) => {
      try {
        const response = await apiClient.get(`/boards/${club.id}/boards/normal`);
        const rawData = Array.isArray(response.data)
          ? response.data
          : response.data?.data || response.data?.content || [];
        
        // 최근 7일 내에 생성된 게시글만 필터링
        const weeklyBoards = rawData.filter((board) => {
          if (!board.createdAt) return false;
          const createdDate = new Date(board.createdAt);
          return createdDate >= sevenDaysAgo;
        });
        
        return {
          clubId: club.id,
          clubName: club.name,
          count: weeklyBoards.length,
        };
      } catch (error) {
        console.error(`클럽 ${club.id}의 게시글 조회 중 오류:`, error);
        return {
          clubId: club.id,
          clubName: club.name,
          count: 0,
        };
      }
    });
    
    const clubCounts = await Promise.all(boardPromises);
    
    // 클럽별 게시글 수로 정렬하고 TOP 5 선택
    const result = clubCounts
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map((club) => ({
        id: club.clubId,
        name: club.clubName,
        postCount: club.count,
      }));
    
    return result;
  } catch (error) {
    console.error("이번 주 게시글이 많은 클럽 조회 중 오류 발생:", error);
    throw error;
  }
};

// ==================== Chart 데이터 변환 함수 ====================

// 금주의 신설 클럽 Chart 데이터
export const getWeeklyNewClubsChartData = async () => {
  try {
    const dateGroups = await getWeeklyNewClubs();
    
    // 최근 7일 날짜 배열 생성
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(
        date.toLocaleDateString("ko-KR", { month: "short", day: "numeric" })
      );
    }
    
    const data = dates.map((date) => dateGroups[date] || 0);
    
    return {
      labels: dates,
      datasets: [
        {
          label: "신설 클럽 수",
          data: data,
          backgroundColor: "rgba(177, 239, 102, 0.6)",
          borderColor: "#b1ef66",
          borderWidth: 1,
        },
      ],
    };
  } catch (error) {
    console.error("금주의 신설 클럽 Chart 데이터 생성 중 오류:", error);
    throw error;
  }
};

// 여성이 많은 클럽 TOP 5 Chart 데이터
export const getFemaleDominantClubsChartData = async () => {
  try {
    const clubs = await getFemaleDominantClubs();
    
    return {
      labels: clubs.map((club) => club.clubName),
      datasets: [
        {
          label: "여성 멤버 수",
          data: clubs.map((club) => club.femaleCount),
          backgroundColor: "rgba(255, 99, 132, 0.6)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 1,
        },
      ],
    };
  } catch (error) {
    console.error("여성이 많은 클럽 Chart 데이터 생성 중 오류:", error);
    throw error;
  }
};

// 남성이 많은 클럽 TOP 5 Chart 데이터
export const getMaleDominantClubsChartData = async () => {
  try {
    const clubs = await getMaleDominantClubs();
    
    return {
      labels: clubs.map((club) => club.clubName),
      datasets: [
        {
          label: "남성 멤버 수",
          data: clubs.map((club) => club.maleCount),
          backgroundColor: "rgba(54, 162, 235, 0.6)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
      ],
    };
  } catch (error) {
    console.error("남성이 많은 클럽 Chart 데이터 생성 중 오류:", error);
    throw error;
  }
};

// 전체 멤버의 연령대별 분포 Chart 데이터 (Pie Chart)
export const getAgePopularClubsChartData = async () => {
  try {
    const allMembers = await fetchAllMembers();
    
    const getAgeGroup = (birthday) => {
      if (!birthday) return null;
      const birthYear = new Date(birthday).getFullYear();
      const currentYear = new Date().getFullYear();
      const age = currentYear - birthYear;
      
      if (age < 20) return "10대";
      if (age < 30) return "20대";
      if (age < 40) return "30대";
      if (age < 50) return "40대";
      if (age < 60) return "50대";
      return "60대 이상";
    };
    
    const ageCount = {};
    
    // 전체 멤버의 연령대별 분포 집계
    allMembers.forEach((member) => {
      if (member.birthday) {
        const ageGroup = getAgeGroup(member.birthday);
        if (ageGroup) {
          ageCount[ageGroup] = (ageCount[ageGroup] || 0) + 1;
        }
      }
    });
    
    const labels = Object.keys(ageCount);
    const data = Object.values(ageCount);
    
    const colors = [
      "rgba(255, 99, 132, 0.6)",
      "rgba(54, 162, 235, 0.6)",
      "rgba(255, 206, 86, 0.6)",
      "rgba(75, 192, 192, 0.6)",
      "rgba(153, 102, 255, 0.6)",
      "rgba(255, 159, 64, 0.6)",
    ];
    
    return {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: colors.slice(0, labels.length),
          borderColor: colors.slice(0, labels.length).map((c) =>
            c.replace("0.6", "1")
          ),
          borderWidth: 1,
        },
      ],
    };
  } catch (error) {
    console.error("전체 멤버 연령대별 분포 Chart 데이터 생성 중 오류:", error);
    throw error;
  }
};

// 멤버가 많은 클럽 TOP 5 Chart 데이터
export const getTopMemberClubsChartData = async () => {
  try {
    const clubs = await getTopMemberClubs();
    
    return {
      labels: clubs.map((club) => club.name),
      datasets: [
        {
          label: "멤버 수",
          data: clubs.map((club) => club.memberCount),
          backgroundColor: "rgba(54, 162, 235, 0.6)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
      ],
    };
  } catch (error) {
    console.error("멤버가 많은 클럽 Chart 데이터 생성 중 오류:", error);
    throw error;
  }
};

// 이번 주에 게시글이 많이 올라온 클럽 TOP 5 Chart 데이터
export const getWeeklyTopPostClubsChartData = async () => {
  try {
    const clubs = await getWeeklyTopPostClubs();
    
    return {
      labels: clubs.map((club) => club.name),
      datasets: [
        {
          label: "게시글 수",
          data: clubs.map((club) => club.postCount),
          backgroundColor: "rgba(75, 192, 192, 0.6)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
      ],
    };
  } catch (error) {
    console.error("이번 주 게시글이 많은 클럽 Chart 데이터 생성 중 오류:", error);
    throw error;
  }
};
