package com.ssafy.hellojob.domain.coverlettercontent.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.hellojob.domain.coverletter.repository.CoverLetterRepository;
import com.ssafy.hellojob.domain.coverlettercontent.dto.ai.request.AIChatRequestDto;
import com.ssafy.hellojob.domain.coverletter.dto.ai.response.AIChatResponseDto;
import com.ssafy.hellojob.domain.coverlettercontent.dto.response.ChatMessageDto;
import com.ssafy.hellojob.domain.coverlettercontent.dto.response.ChatResponseDto;
import com.ssafy.hellojob.domain.coverlettercontent.entity.ChatLog;
import com.ssafy.hellojob.domain.coverlettercontent.entity.CoverLetterContent;
import com.ssafy.hellojob.domain.coverlettercontent.entity.CoverLetterContentStatus;
import com.ssafy.hellojob.domain.coverlettercontent.repository.ChatLogRepository;
import com.ssafy.hellojob.domain.coverlettercontent.repository.CoverLetterContentRepository;
import com.ssafy.hellojob.global.common.client.FastApiClientService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatLogService {

    private final ChatLogRepository chatLogRepository;
    private final CoverLetterContentRepository coverLetterContentRepository;
    private final CoverLetterRepository coverLetterRepository;
    private final FastApiClientService fastApiClientService;

    // JSON을 자바 객체로 바꾸거나 자바 객체를 JSON으로 바꿔줌
    private final ObjectMapper mapper = new ObjectMapper();

    public List<ChatMessageDto> getContentChatLog(Integer contentId) {
        log.debug("🌞 지금 GetContentChatLog 들어옴");
        String chatLogString = chatLogRepository.findChatLogContentById(contentId);
        log.debug("🌞 ChatLogString: {}", chatLogString);

        if (chatLogString == null || chatLogString.isBlank()) return new ArrayList<>();

        List<ChatMessageDto> chatLog = parseJson(chatLogString);

        log.debug("🌞 chatLog {}", chatLog.toArray().toString());

        return chatLog;
    }

    @Transactional
    public ChatResponseDto sendChat(CoverLetterContent content, AIChatRequestDto aiChatRequestDto) {

        AIChatResponseDto response = sendChatToFastApi(aiChatRequestDto);

        ChatMessageDto userMessages = ChatMessageDto.builder()
                .sender("user")
                .message(aiChatRequestDto.getEdit_content().getUser_message())
                .build();

        ChatMessageDto aiMessage = ChatMessageDto.builder()
                .sender("ai")
                .message(response.getAi_message())
                .build();

        // 본문 내용 저장
        String contentDetail = aiChatRequestDto.getEdit_content().getCover_letter();

        content.updateCoverLetterContentWithChat(contentDetail);

        // 새로운 채팅 배열
        List<ChatMessageDto> newChats = new ArrayList<>();

        Optional<ChatLog> chatLogOpt = chatLogRepository.findById(content.getContentId());

        if (chatLogOpt.isEmpty()) {
            // 기존 로그 없으면 새로 생성
            newChats.add(userMessages);
            newChats.add(aiMessage);

            ChatLog newChat = ChatLog.builder()
                    .coverLetterContent(content)
                    .chatLogContent(toJson(newChats))
                    .updatedCount(1)
                    .build();

            chatLogRepository.save(newChat);
        } else {
            // 있으면 기존 로그를 String으로 바꿔서 추가한 후 다시 JSON형태로 변경
            ChatLog existingLog = chatLogOpt.get();

            newChats = parseJson(existingLog.getChatLogContent());

            newChats.add(userMessages);
            newChats.add(aiMessage);

            existingLog.updateChatLog(toJson(newChats));
        }

        // 작성 중이 아니라면 작성 중으로 상태 변경
        if (content.getContentStatus() != CoverLetterContentStatus.IN_PROGRESS) {
            content.updateContentStatus(CoverLetterContentStatus.IN_PROGRESS);
        }

        return ChatResponseDto.builder()
                .aiMessage(aiMessage.getMessage())
                .contentStatus(content.getContentStatus())
                .build();
    }

    public AIChatResponseDto sendChatToFastApi(AIChatRequestDto requestDto) {
        AIChatResponseDto response = fastApiClientService.sendChatToFastApi(requestDto);
        return response;
    }

    // JSON 형태로 파싱
    private List<ChatMessageDto> parseJson(String json) {
        if (json == null || json.isBlank()) return new ArrayList<>();
        try {
            return mapper.readValue(json, new TypeReference<>() {
            });
        } catch (JsonProcessingException e) {
            throw new RuntimeException("채팅 로그 파싱 실패", e);
        }
    }

    // String 형태로 직렬화
    private String toJson(List<ChatMessageDto> messages) {
        try {
            return mapper.writeValueAsString(messages);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("채팅 JSON 직렬화 실패", e);
        }
    }


}
