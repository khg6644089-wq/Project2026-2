package com.study.lastlayer.weekhistory;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.study.lastlayer.member.Member;
import com.study.lastlayer.member.MemberRepository;
import com.study.lastlayer.weekhistory.WeekHistoryDto.*;

import jakarta.transaction.Transactional;

@Service
@Transactional
public class WeekHistoryService {

    private final WeekHistoryRepository repository;
    private final MemberRepository memberRepository;

    public WeekHistoryService(WeekHistoryRepository repository,
                              MemberRepository memberRepository) {
        this.repository = repository;
        this.memberRepository = memberRepository;
    }

    private Member getMember(Long memberId) {
        return memberRepository.findById(memberId)
                .orElseThrow(() -> new IllegalArgumentException("회원이 존재하지 않습니다."));
    }

    // 등록
    public WeekHistoryResponse addWeekHistory(Long memberId, WeekHistoryRequest request) {

        Member member = getMember(memberId);
        LocalDate date =  LocalDate.parse(request.date());
        
        WeekHistory entity = repository.findByMemberAndDate(member, date)
        		.orElse(null);
        
        if (entity != null) {
        	entity.setWeight(request.weight());
        	return new WeekHistoryResponse(entity, "같은 날짜 기록이 있어 체중이 수정되었습니다.");
        }
        
        entity =  new WeekHistory(date, request.weight(), member);
        repository.save(entity);
        
        return new WeekHistoryResponse(entity, "체중 기록이 등록되었습니다.");
       
    }

    // 수정
    public WeekHistoryResponse updateWeekHistory(Long memberId, Long id,
                                                 WeekHistoryUpdateRequest request) {

        WeekHistory entity = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 ID의 기록이 없습니다."));

        if (!entity.getMember().getMember_id().equals(memberId)) {
            throw new IllegalArgumentException("해당 회원의 기록이 아닙니다.");
        }

        entity.setWeight(request.weight());

        return new WeekHistoryResponse(entity, "체중 기록이 수정되었습니다.");
    }

    // 삭제
    public String deleteWeekHistory(Long memberId, Long id) {

        WeekHistory entity = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 ID의 기록이 없습니다."));

        if (!entity.getMember().getMember_id().equals(memberId)) {
            throw new IllegalArgumentException("해당 회원의 기록이 아닙니다.");
        }

        repository.delete(entity);

        return "체중 기록이 삭제되었습니다.";
    }

    // 페이징 조회
    public List<WeekHistoryListResponse> getWeekHistory(Long memberId,
                                                        String sort,
                                                        int page,
                                                        int size) {

        Member member = getMember(memberId);

        PageRequest pageable = PageRequest.of(page, size);

        List<WeekHistory> list = sort.equals("oldest") ?
                repository.findByMemberOrderByDateAsc(member, pageable).getContent() :
                repository.findByMemberOrderByDateDesc(member, pageable).getContent();

        return list.stream()
                .map(WeekHistoryListResponse::new)
                .collect(Collectors.toList());
    }

    // 전체 조회
    public List<WeekHistoryListResponse> getAllWeekHistory(Long memberId,
                                                           String sort,
                                                           String startDate,
                                                           String endDate) {

        Member member = getMember(memberId);

        LocalDate start = startDate != null ?
                LocalDate.parse(startDate) : LocalDate.of(1970, 1, 1);

        LocalDate end = endDate != null ?
                LocalDate.parse(endDate) : LocalDate.now();

        List<WeekHistory> list = sort.equals("oldest") ?
                repository.findByMemberAndDateBetweenOrderByDateAsc(member, start, end) :
                repository.findByMemberAndDateBetweenOrderByDateDesc(member, start, end);

        return list.stream()
                .map(WeekHistoryListResponse::new)
                .collect(Collectors.toList());
    }
}