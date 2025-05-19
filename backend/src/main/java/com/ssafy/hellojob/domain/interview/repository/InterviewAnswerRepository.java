package com.ssafy.hellojob.domain.interview.repository;

import com.ssafy.hellojob.domain.interview.entity.InterviewAnswer;
import com.ssafy.hellojob.domain.interview.entity.InterviewVideo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface InterviewAnswerRepository extends JpaRepository<InterviewAnswer, Integer> {

    List<InterviewAnswer> findInterviewAnswerByInterviewVideo(InterviewVideo interviewVideo);

    @Query("SELECT a FROM InterviewAnswer a JOIN FETCH a.interviewQuestion WHERE a.interviewVideo = :video")
    List<InterviewAnswer> findInterviewAnswerWithQuestionByInterviewVideo(@Param("video") InterviewVideo video);

    List<InterviewAnswer> findByInterviewVideoOrderByCreatedAtAsc(InterviewVideo interviewVideo);

    @Query("SELECT new map(ia.interviewVideo.interviewVideoId as videoId, ia.interviewQuestion as firstQuestion) " +
            "FROM InterviewAnswer ia " +
            "WHERE ia.interviewVideo.interviewVideoId IN :videoIds " +
            "AND ia.interviewAnswerId = (SELECT MIN(ia2.interviewAnswerId) FROM InterviewAnswer ia2 " +
            "                            WHERE ia2.interviewVideo = ia.interviewVideo)")
    List<Map<String, Object>> findFirstQuestionsByVideoIds(@Param("videoIds") List<Integer> videoIds);

    List<InterviewAnswer> findAllByInterviewVideo(InterviewVideo interviewVideo);

}
