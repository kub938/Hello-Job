package com.ssafy.hellojob.domain.interview.entity;

import com.ssafy.hellojob.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "interview")
public class Interview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "interview_id", nullable = false)
    private Integer interviewId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "cs", nullable = false)
    private boolean cs;

    public static Interview of(User user, boolean cs){
        Interview interview = new Interview();
        interview.user = user;
        interview.cs = cs;
        return interview;
    }

}
