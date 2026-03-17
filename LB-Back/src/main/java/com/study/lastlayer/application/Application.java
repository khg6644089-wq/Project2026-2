package com.study.lastlayer.application;


import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

import com.study.lastlayer.club.Club;
import com.study.lastlayer.member.Member;

@Entity
@Table(name = "application")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // 식별자 (PK)

    // 신청한 회원
    @ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "member_id", nullable = false)
	private Member member;

    // 신청한 클럽
    @ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "club_id", nullable = false)
	private Club club;

    // 상태 (P, A, R)
    @Enumerated(EnumType.STRING)
    @Column
    private ApplicationStatus status;

    // 처리 완료 시간
    @Column
    private LocalDateTime completedAt;
}