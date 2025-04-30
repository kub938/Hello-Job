package com.ssafy.hellojob.domain.coverletter.repository;

import com.ssafy.hellojob.domain.coverletter.dto.response.ChatMessageDto;
import com.ssafy.hellojob.domain.coverletter.entity.ChatLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatLogRepository extends JpaRepository<ChatLog, Integer> {

    @Query("SELECT c.chatLogContent FROM ChatLog c WHERE c.coverLetterContent.contentId = :contentId")
    String findChatLogContentById(@Param("contentId") Integer contentId);
}
