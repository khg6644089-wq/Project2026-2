package com.study.lastlayer.member;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.study.lastlayer.exception.BadRequestException;
import com.study.lastlayer.file.File;
import com.study.lastlayer.file.FileRepository;
import com.study.lastlayer.fileupload.FileUploadService;

// =========================
// DTO: 회원 정보 업데이트용
// =========================
record MemberUpdateDto(
        String name,
        String phone,
        String gender,
        String birthday, // "yyyy-MM-dd"
        Float height,
        Float weight,
        Integer target_date,
        String goal,
        Float goal_weight,
        String allergies,
        String special_notes
) {}

// =========================
// Service
// =========================
@Service
@Transactional
public class MemberService {

    @Autowired
    private MemberRepository memberRepository;

    @Autowired
    private FileUploadService fileUploadService;

    @Autowired
    private FileRepository fileRepository;

    // =========================
    // 회원 정보 업데이트
    // =========================
    public Member updateMember(Long id, MemberUpdateDto dto) {
        // 1. 회원 조회
        Member member = memberRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 회원이 존재하지 않습니다. id=" + id));

        // 2. 데이터 업데이트
        member.setName(dto.name());
        member.setPhone(dto.phone());
        member.setGender(dto.gender());
        member.setBirthday(LocalDate.parse(dto.birthday()));
        member.setHeight(dto.height());
        member.setWeight(dto.weight());
        member.setTarget_date(dto.target_date());
        member.setGoal(dto.goal());
        member.setGoal_weight(dto.goal_weight());
        member.setAllergies(dto.allergies());
        member.setSpecial_notes(dto.special_notes());

        // 3. 변경된 신체 정보를 바탕으로 하루 권장 칼로리 재계산
        member.updateDailyCalories();

        // Dirty Checking으로 자동 반영
        return member;
    }

    // =========================
    // 회원 조회
    // =========================
    @Transactional(readOnly = true)
    public Member getMember(Long memberId) {
        return memberRepository.findById(memberId)
                .orElseThrow(() -> new BadRequestException("해당 회원이 존재하지 않습니다. id=" + memberId));
    }

    // =========================
    // 프로필 이미지 조회
    // =========================
    @Transactional(readOnly = true)
    public File getProfileImage(Long memberId) {
        Member member = getMember(memberId);
        return member.getProfileImage();
    }

    // =========================
    // 프로필 이미지 업데이트
    // =========================
    public File updateProfileImage(Long memberId, MultipartFile file) throws IOException {
        Member member = getMember(memberId);


        // 단일 파일 업로드
		File savedFile = fileUploadService.fileCreateOne(file, 64, 64);
        if (savedFile != null) {
            member.setProfileImage(savedFile);
        }
        return savedFile;
    }

    // =========================
    // 프로필 이미지 삭제
    // =========================
    public void deleteProfileImage(Long memberId) {
        Member member = getMember(memberId);
        File profileImage = member.getProfileImage();
        if (profileImage != null) {
            // 1. DB에서 사용자와 파일의 연관 관계 끊기
            member.setProfileImage(null);

            // 2. 물리적 파일 삭제
            fileUploadService.deletePhysicalFile(profileImage.getFilename());

            // 3. DB에서 File 레코드 삭제
            fileRepository.delete(profileImage);
        }
    }

	// 모든 회원 조회
	@Transactional(readOnly = true)
	public List<Member> getAllMembers() {
		return memberRepository.findAll();
	}

    // =========================
    // 회원 포인트 조회
    // =========================
    @Transactional(readOnly = true)
    public Long getPoints(Long memberId) {
        Member member = getMember(memberId);
        return member.getPoint();
    }

    // =========================
    // 회원 포인트 차감 (응모 등)
    // =========================
    public Member deductPoints(Long memberId, Long points) {
        Member member = getMember(memberId);

        if (member.getPoint() < points) {
            throw new BadRequestException(
                    "MemberID[" + member.getMember_id() + "] 포인트가 부족합니다."
            );
        }

        member.setPoint(member.getPoint() - points);

        // Dirty Checking으로 트랜잭션 내 자동 반영
        return member;
    }
}