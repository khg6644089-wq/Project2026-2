package com.study.lastlayer.clubmember;


import com.study.lastlayer.club.Club;
import com.study.lastlayer.member.Member;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "club_member")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClubMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 클럽
    @ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "club_id", nullable = false)
	private Club club;

    // 회원
    @ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "member_id", nullable = false)
	private Member member;
}
