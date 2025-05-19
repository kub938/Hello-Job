package com.ssafy.hellojob.domain.coverlettercontent.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ssafy.hellojob.domain.coverlettercontent.dto.ai.request.AIChatForEditRequestDto;
import com.ssafy.hellojob.domain.coverlettercontent.dto.ai.request.AIChatRequestDto;
import com.ssafy.hellojob.domain.coverlettercontent.dto.ai.response.AIChatForEditResponseDto;
import com.ssafy.hellojob.domain.coverlettercontent.dto.ai.response.AIChatResponseDto;
import com.ssafy.hellojob.domain.coverlettercontent.dto.response.ChatMessageDto;
import com.ssafy.hellojob.domain.coverlettercontent.dto.response.ChatResponseDto;
import com.ssafy.hellojob.domain.coverlettercontent.entity.ChatLog;
import com.ssafy.hellojob.domain.coverlettercontent.entity.CoverLetterContent;
import com.ssafy.hellojob.domain.coverlettercontent.entity.CoverLetterContentStatus;
import com.ssafy.hellojob.domain.coverlettercontent.repository.ChatLogRepository;
import com.ssafy.hellojob.global.common.client.FastApiClientService;
import com.ssafy.hellojob.global.exception.BaseException;
import com.ssafy.hellojob.global.exception.ErrorCode;
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
    private final FastApiClientService fastApiClientService;

    // JSON을 자바 객체로 바꾸거나 자바 객체를 JSON으로 바꿔줌
    private final ObjectMapper mapper = new ObjectMapper();

    public List<ChatMessageDto> getContentChatLog(Integer contentId) {
        log.debug("🌞 지금 GetContentChatLog 들어옴");
        String chatLogString = chatLogRepository.findChatLogContentById(contentId);
        log.debug("🌞 ChatLogString: {}", chatLogString);

        if (chatLogString == null || chatLogString.isBlank()) return new ArrayList<>();

        List<ChatMessageDto> chatLog = parseJson(chatLogString);

        return chatLog;
    }

    @Transactional
    public ChatResponseDto sendChatForEdit(CoverLetterContent content, AIChatForEditRequestDto aiChatForEditRequestDto) {

        // FastAPI 요청
        AIChatForEditResponseDto response = fastApiClientService.sendChatForEditToFastApi(aiChatForEditRequestDto);

        ChatMessageDto userMessage = ChatMessageDto.builder()
                .sender("user")
                .message(aiChatForEditRequestDto.getEdit_content().getUser_message())
                .build();

        ChatMessageDto aiMessage = ChatMessageDto.builder()
                .sender("ai")
                .message(response.getAi_message())
                .build();

        // 본문 내용 저장
        String contentDetail = aiChatForEditRequestDto.getEdit_content().getCover_letter();
        content.updateCoverLetterContentWithChat(contentDetail);

        // 채팅 저장
        saveNewChatLog(content, userMessage, aiMessage);

        updateContentStatus(content);

        return ChatResponseDto.builder()
                .aiMessage(aiMessage.getMessage())
                .contentStatus(content.getContentStatus())
                .build();
    }

    @Transactional
    public ChatResponseDto sendChat(CoverLetterContent content, AIChatRequestDto aiChatRequestDto) {
        // FastAPI 요청
        AIChatResponseDto response = fastApiClientService.sendChatToFastApi(aiChatRequestDto);

        if (response.getStatus().equals("error") || response.getAi_message() == null || response.getAi_message().isBlank()) {
            throw new BaseException(ErrorCode.FAST_API_RESPONSE_ERROR);
        }

        ChatMessageDto userMessage = ChatMessageDto.builder()
                .sender("user")
                .message(aiChatRequestDto.getUser_message())
                .build();

        ChatMessageDto aiMessage = ChatMessageDto.builder()
                .sender("ai")
                .message(response.getAi_message())
                .build();

        // 본문 내용 저장
        String contentDetail = aiChatRequestDto.getCover_letter().getCover_letter();
        content.updateCoverLetterContentWithChat(contentDetail);

        // 채팅 저장
        saveNewChatLog(content, userMessage, aiMessage);

        updateContentStatus(content);

        return ChatResponseDto.builder()
                .aiMessage(aiMessage.getMessage())
                .contentStatus(content.getContentStatus())
                .build();
    }

    public void saveNewChatLog(CoverLetterContent content, ChatMessageDto userMessage, ChatMessageDto aiMessage) {
        List<ChatMessageDto> newChats = new ArrayList<>();

        Optional<ChatLog> chatLogOpt = chatLogRepository.findById(content.getContentId());

        if (chatLogOpt.isEmpty()) {
            // 기존 로그 없으면 새로 생성
            newChats.add(userMessage);
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

            newChats.add(userMessage);
            newChats.add(aiMessage);

            existingLog.updateChatLog(toJson(newChats));
        }
    }

    public void updateContentStatus(CoverLetterContent content) {
        // 작성 중이 아니라면 작성 중으로 상태 변경
        if (content.getContentStatus() != CoverLetterContentStatus.IN_PROGRESS) {
            content.updateContentStatus(CoverLetterContentStatus.IN_PROGRESS);
        }
    }

    // JSON 형태로 파싱
    private List<ChatMessageDto> parseJson(String json) {
        if (json == null || json.isBlank()) return new ArrayList<>();
        try {
            return mapper.readValue(json, new TypeReference<>() {
            });
        } catch (JsonProcessingException e) {
            throw new BaseException(ErrorCode.DESERIALIZATION_FAIL);
        }
    }

    // String 형태로 직렬화
    private String toJson(List<ChatMessageDto> messages) {
        try {
            return mapper.writeValueAsString(messages);
        } catch (JsonProcessingException e) {
            throw new BaseException(ErrorCode.SERIALIZATION_FAIL);
        }
    }


}
