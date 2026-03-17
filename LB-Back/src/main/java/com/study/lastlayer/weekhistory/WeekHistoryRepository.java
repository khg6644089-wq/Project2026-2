package com.study.lastlayer.weekhistory;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.study.lastlayer.member.Member;

public interface WeekHistoryRepository extends JpaRepository<WeekHistory, Long> {

    Page<WeekHistory> findByMemberOrderByDateDesc(Member member, Pageable pageable);
    Page<WeekHistory> findByMemberOrderByDateAsc(Member member, Pageable pageable);

    List<WeekHistory> findByMemberAndDateBetweenOrderByDateAsc(Member member, LocalDate start, LocalDate end);
    List<WeekHistory> findByMemberAndDateBetweenOrderByDateDesc(Member member, LocalDate start, LocalDate end);
    
    Optional<WeekHistory> findByMemberAndDate(Member member, LocalDate date);
}