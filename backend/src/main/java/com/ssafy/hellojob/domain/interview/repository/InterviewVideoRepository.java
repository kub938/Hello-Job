package com.ssafy.hellojob.domain.interview.repository;

import com.ssafy.hellojob.domain.interview.entity.Interview;
import com.ssafy.hellojob.domain.interview.entity.InterviewVideo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InterviewVideoRepository extends JpaRepository<InterviewVideo, Integer> {

    List<InterviewVideo> findAllByInterviewOrderByStartDesc(Interview interview);

}
