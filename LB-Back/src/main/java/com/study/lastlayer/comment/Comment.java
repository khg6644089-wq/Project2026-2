package com.study.lastlayer.comment;

import java.time.LocalDateTime;

import com.study.lastlayer.board.Board;
import com.study.lastlayer.member.Member;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "comment")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Comment {
	
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; 
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name ="board_id", nullable = false)
	private Board board;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "member_id", nullable = false)
	private Member member;
	
	@Column(nullable = false)
	private String content;

	@Column(nullable = false)
	private LocalDateTime createdAt;
	
	@PrePersist
	public void onCreated() {
		this.createdAt = LocalDateTime.now();
	}

}













