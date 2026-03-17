package com.study.lastlayer.club;


import java.time.LocalDateTime;

import com.study.lastlayer.file.File;
import com.study.lastlayer.member.Member;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "club")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Club {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; 
    @Column
    private String name; 

    @Column
    private String description; 

  
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "managerId", nullable = false)
	private Member member;

  
	@OneToOne(fetch = FetchType.LAZY)
	@JoinColumn(name="bgFileId")
	private File file;
    

    @Column
    private String keywords;
    
    @Column(nullable = false)
	private LocalDateTime createdAt; 
    
    @PrePersist
	public void onCreated() {
		this.createdAt = LocalDateTime.now();
	}
    
    
}