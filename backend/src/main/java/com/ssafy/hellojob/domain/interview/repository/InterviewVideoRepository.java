package com.ssafy.hellojob.domain.interview.repository;

import com.ssafy.hellojob.domain.interview.entity.InterviewVideo;
import com.ssafy.hellojob.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewVideoRepository extends JpaRepository<InterviewVideo, Integer> {

    @Query("SELECT iv FROM InterviewVideo iv " +
            "LEFT JOIN iv.interview i " +
            "LEFT JOIN iv.coverLetterInterview cli " +
            "WHERE i.user = :user OR cli.user = :user " +
            "ORDER BY iv.start DESC NULLS LAST")
    List<InterviewVideo> findAllByUser(@Param("user") User user);

}
