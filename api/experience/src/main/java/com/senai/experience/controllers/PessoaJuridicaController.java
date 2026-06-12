package com.senai.experience.controllers;

import com.senai.experience.DTO.request.PessoaJuridicaRequest;
import com.senai.experience.DTO.response.PessoaJuridicaResponse;
import com.senai.experience.entities.PessoaJuridica;
import com.senai.experience.mappers.PessoaJuridicaMapper;
import com.senai.experience.services.PessoaJuridicaService;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/pessoaJuridica")
public class PessoaJuridicaController {

    private final PessoaJuridicaService service;

    public PessoaJuridicaController(PessoaJuridicaService service) {
        this.service = service;
    }

    @GetMapping
    public Page<PessoaJuridicaResponse> getAll(Pageable pageable) {
        return service.findAll(pageable).map(PessoaJuridicaMapper::toResponse);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PessoaJuridicaResponse> getById(@PathVariable Long id) {
        PessoaJuridica pessoaJuridica = service.findById(id);
        if (pessoaJuridica != null) {
            return ResponseEntity.ok(PessoaJuridicaMapper.toResponse(pessoaJuridica));
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<PessoaJuridicaResponse> create(@RequestBody PessoaJuridicaRequest dto) {
        PessoaJuridica entity = PessoaJuridicaMapper.toEntity(dto);
        PessoaJuridica salvo = service.save(entity);
        return ResponseEntity.status(201).body(PessoaJuridicaMapper.toResponse(salvo));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<PessoaJuridicaResponse> update(@PathVariable Long id, @RequestBody PessoaJuridicaRequest dto) {
        PessoaJuridica existingPessoaJuridica = service.findById(id);
        if (existingPessoaJuridica != null) {
            PessoaJuridica entity = PessoaJuridicaMapper.toEntity(dto);
            entity.setId(id);
            return ResponseEntity.ok(PessoaJuridicaMapper.toResponse(service.update(entity)));
        }
        return ResponseEntity.notFound().build();
    }
}